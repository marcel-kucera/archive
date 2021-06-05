use std::{
    fs::OpenOptions,
    io::{stdin, Write},
    path::Path,
};

pub fn read_input() -> String {
    let mut input: String = String::new();
    stdin().read_line(&mut input).unwrap();
    input.pop(); // Remove newline
    input
}

pub fn read_number() -> i32 {
    loop {
        let input = read_input();
        let number = input.parse::<i32>();
        match number {
            Ok(num) => return num,
            Err(_e) => println!("Error: [{}] is not a number. Try again", input),
        }
    }
}

pub fn slice_to_string<T: AsRef<str>>(vec: &[T], seperator: &str) -> String {
    let mut out = String::new();

    for (i, el) in vec.iter().enumerate() {
        out.push_str(el.as_ref());
        if i != vec.len() - 1 {
            out.push_str(seperator);
        }
    }

    out
}

pub fn ask_continue() -> bool {
    ask_bool_question("Continue?")
}

pub fn ask_bool_question(q: &str) -> bool {
    println!("{} [y/n]:", q);
    match &*read_input().to_lowercase() {
        "y" => true,
        _ => false,
    }
}

pub fn replace_in_file(path: &str, orig: &str, replace: &str) {
    let mut file_string =
        std::fs::read_to_string(path).expect(&format!("Error couldnt open {}", path));
    file_string = file_string.replace(orig, replace);
    std::fs::write(path, file_string.as_bytes())
        .expect(&format!("Error couldnt write to {}", path));
}

pub fn create_file(path: &str, content: &str) {
    std::fs::File::create(path)
        .expect(&format!("Couldnt create file {}", path))
        .write_all(content.as_bytes())
        .expect(&format!("Couldnt write to file {}", path));
}

pub fn create_file_all(path: &str, content: &str) {
    //Get directory path
    let path_vec = path.split("/").collect::<Vec<&str>>();
    let mut dir_path = String::new();
    for (i, e) in path_vec.iter().enumerate() {
        if !e.is_empty() && i < path_vec.len() - 1 {
            dir_path.push_str(&("/".to_string() + e));
        }
    }

    //create directory
    let create_dir = std::fs::create_dir_all(dir_path);
    if create_dir.is_err() {
        if create_dir.unwrap_err().kind() != std::io::ErrorKind::AlreadyExists {
            panic!(format!("Error mountpoint {} could not be created", path));
        }
    }

    //create file
    create_file(path, content)
}

pub fn append_file(path: &str, content: &str) {
    OpenOptions::new()
        .append(true)
        .open(path)
        .expect(&format!("Couldnt open file {}", path))
        .write_all(content.as_bytes())
        .expect(&format!("Couldnt write to file {}", path));
}

pub fn path_exists(path: &str) -> bool {
    Path::new(path).exists()
}
