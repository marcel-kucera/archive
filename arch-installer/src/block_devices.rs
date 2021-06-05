use crate::commands::run_output;

pub struct BlockDevice {
    pub path: String,
    pub info: String,
}

fn get_block_devices(args: &[&str]) -> Vec<BlockDevice> {
    let mut devices: Vec<BlockDevice> = vec![];
    let raw_string = run_output(&"lsblk".to_string(), args).trim().to_owned();
    for el in raw_string.split("\n").into_iter() {
        devices.push(string_to_block_device(el))
    }
    return devices;
}

pub fn get_device_children(device: &str) -> Vec<BlockDevice> {
    get_block_devices(&[device, "-lno", "PATH,SIZE,PARTTYPENAME"])
}

pub fn get_device_raw() -> Vec<BlockDevice> {
    get_block_devices(&["-lno", "PATH,SIZE", "--nodeps"])
}

fn string_to_block_device(el: &str) -> BlockDevice {
    let mut props = el.split_whitespace().into_iter();
    let path = props.next().expect("Error with [lsblk]").to_owned();
    let mut info = String::new();
    for i in props {
        info += &format!("{} ", i);
    }
    BlockDevice {
        path: path,
        info: info,
    }
}
