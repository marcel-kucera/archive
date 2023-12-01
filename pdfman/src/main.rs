use std::{
    error::Error,
    fs::File,
    io::{Cursor, Read, Seek, SeekFrom, Write},
};

use image::{io::Reader, ImageOutputFormat};

mod bytecounter;

struct Img2Pdf<W: Write> {
    counter: u32,
    xref: Vec<usize>,
    page_ids: Vec<u32>,
    w: bytecounter::ByteCounter<W>,
    init: bool,
}

impl<W: Write> Img2Pdf<W> {
    fn new(w: W) -> Self {
        Img2Pdf {
            counter: 1,
            xref: Vec::new(),
            page_ids: Vec::new(),
            w: bytecounter::ByteCounter::new(w),
            init: false,
        }
    }

    fn init(&mut self) -> Result<(), std::io::Error> {
        self.write_header()?;
        // Write catalog
        let props = vec!["/Type /Catalog", "/Pages 2 0 R"];
        self.new_obj(props)?;

        //Reserve id for pages at end of file
        self.counter += 1;

        self.init = true;
        Ok(())
    }

    fn write_header(&mut self) -> Result<(), std::io::Error> {
        self.w.write_all(b"%PDF-1.7\n\n")
    }

    fn new_obj(&mut self, props: Vec<&str>) -> Result<u32, std::io::Error> {
        let obj_start = self.w.bytes_written();
        self.xref.push(obj_start);

        let mut s = String::new();
        s.push_str(&format!("{} 0 obj\n", self.counter));
        s.push_str("<<\n");
        for prop in props {
            s.push_str(&format!("  {}\n", prop));
        }
        s.push_str(">>\n");
        s.push_str("endobj\n\n");

        self.w.write_all(s.as_bytes())?;

        self.counter += 1;
        Ok(self.counter - 1)
    }
    fn new_stream<R: Read>(
        &mut self,
        props: Vec<&str>,
        streamreader: &mut R,
    ) -> Result<u32, std::io::Error> {
        let mut s = String::new();
        s.push_str(&format!("{} 0 obj\n", self.counter));
        s.push_str("<<\n");
        for prop in props {
            s.push_str(&format!("  {}\n", prop));
        }
        s.push_str(">>\n");
        s.push_str("stream\n");
        self.w.write_all(s.as_bytes()).unwrap();

        let mut data = Vec::new();
        streamreader.read_to_end(&mut data).unwrap();
        self.w.write_all(&data).unwrap();

        // Stream and Object end
        let mut s = String::new();
        s.push_str("\n");
        s.push_str("endstream\n");
        s.push_str("endobj\n\n");
        self.w.write_all(s.as_bytes()).unwrap();
        self.counter += 1;
        Ok(self.counter - 1)
    }

    fn add_image<B: AsRef<[u8]>>(&mut self, img: B) -> Result<(), Box<dyn Error>> {
        // Get Image Data
        let img_dec = Reader::new(Cursor::new(img))
            .with_guessed_format()?
            .decode()?
            .into_rgb8();

        let dim = img_dec.dimensions();

        // convert image
        let mut img_buf: Cursor<Vec<u8>> = Cursor::new(Vec::new());
        img_dec.write_to(&mut img_buf, ImageOutputFormat::Jpeg(80))?;
        let len = img_buf.seek(SeekFrom::End(0))?;

        // write image cmd stream
        let imgcmd = format!("q\n{} 0 0 {} 0 0 cm\n/Im0 Do\nQ", dim.0, dim.1);
        let length_string = format!("/Length {}", imgcmd.len());
        let props: Vec<&str> = vec![&length_string];
        let img_cmd_id = self.new_stream(props, &mut imgcmd.as_bytes())?;

        // write image data stream
        let lenstring = format!("/Length {}", len);
        let heightstring = format!("/Height {}", dim.1);
        let widthstring = format!("/Width {}", dim.0);
        let props: Vec<&str> = vec![
            &lenstring,
            &heightstring,
            &widthstring,
            "/BitsPerComponent 8",
            "/ColorSpace /DeviceRGB",
            "/Filter /DCTDecode",
            "/Subtype /Image",
            "/Type /XObject",
        ];
        img_buf.seek(SeekFrom::Start(0)).unwrap();
        let img_data_id = self.new_stream(props, &mut img_buf)?;

        //add page
        let mediaboxstring = format!("/MediaBox [ 0 0 {} {} ]", dim.0, dim.1);
        let contentstring = format!("/Contents {} 0 R", img_cmd_id);
        let resourcestring = format!("/Resources << /XObject << /Im0 {} 0 R >> >>", img_data_id);
        let props = vec![
            "/Type /Page",
            &mediaboxstring,
            "/Parent 2 0 R",
            &contentstring,
            &resourcestring,
        ];
        let page_id = self.new_obj(props)?;
        self.page_ids.push(page_id);
        Ok(())
    }

    fn finish(&mut self) -> Result<usize, std::io::Error> {
        self.write_pages()?;
        let xref_start = self.w.bytes_written();
        self.write_xref()?;
        self.write_trailer(xref_start)?;
        Ok(self.w.bytes_written())
    }

    fn write_pages(&mut self) -> Result<(), std::io::Error> {
        // reset counter to 2 for pages object
        let orig_counter = self.counter;
        self.counter = 2;

        // pages offset for use in xref
        let pages_offset = self.w.bytes_written();

        // build pages object
        let mut kids_string = String::new();
        kids_string.push_str("/Kids [");
        for id in &self.page_ids {
            kids_string.push_str(&format!(" {} 0 R", id));
        }
        kids_string.push_str(" ]");

        let count_string = format!("/Count {}", self.page_ids.len());
        let props = vec!["/Type /Pages", &count_string, &kids_string];
        self.new_obj(props)?;

        self.xref.pop(); // remove wrong position
        self.xref.insert(1, pages_offset); // Pages is second object but at the end of the file

        //restore counter
        self.counter = orig_counter;

        Ok(())
    }

    fn write_xref(&mut self) -> Result<(), std::io::Error> {
        let mut s = String::new();
        let xref_header = format!("xref\n0 {}\n", self.xref.len());
        s.push_str(&xref_header);
        let xref_init = "0000000000 65535 f\n";
        s.push_str(xref_init);

        for entry in &self.xref {
            let xref_entry = format!("{:0>10} 00000 n\n", entry);
            s.push_str(&xref_entry);
        }
        self.w.write_all(s.as_bytes())
    }
    fn write_trailer(&mut self, xref_start: usize) -> Result<(), std::io::Error> {
        let trailer = format!(
            "trailer\n<<\n  /Root {} 0 R\n  /Size {}\n>>\nstartxref {}\n%%EOF",
            1,
            self.counter - 1,
            xref_start
        );
        self.w.write_all(trailer.as_bytes())
    }
}

fn main() {
    let f = File::create("test2.pdf").unwrap();
    let mut pdf = Img2Pdf::new(f);
    pdf.init().unwrap();

    let mut img = File::open("s.jpg").unwrap();
    let mut img_buf = Vec::new();
    img.read_to_end(&mut img_buf).unwrap();
    pdf.add_image(img_buf).unwrap();

    let mut img = File::open("mem.jpg").unwrap();
    let mut img_buf = Vec::new();
    img.read_to_end(&mut img_buf).unwrap();
    pdf.add_image(img_buf).unwrap();

    let bytes = pdf.finish().unwrap();
    println!("Bytes written: {}", bytes);
}
