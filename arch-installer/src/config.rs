use std::{fs, path::Path, vec};

use linked_hash_map::LinkedHashMap;
use yaml_rust::{Yaml, YamlLoader};

pub struct Config {
    pub encrypt: bool,
    pub lvm: Vec<LVMPart>,
    pub packages: Vec<String>,
    pub timezone: String,
    pub locale: Vec<String>,
    pub lang: String,
    pub keymap: String,
    pub hostname: String,
    pub username: String,
    pub postinstall_cmds: Vec<String>,
    pub postinstall_chroot_cmds: Vec<String>,
    pub configmaps: Vec<ConfigMap>,
}

pub struct LVMPart {
    pub name: String,
    pub mount: String,
    pub size: i64,
    pub keep_on_reinstall: bool,
}

pub struct ConfigMap {
    pub path: String,
    pub content: String,
}

pub fn build_config(str: String) -> Config {
    let yaml = &YamlLoader::load_from_str(&str).expect("Error parsing config")[0];

    let encrypt: bool;
    let lvm: Vec<LVMPart>;
    let packages: Vec<String>;
    let timezone: String;
    let mut locale: Vec<String>;
    let lang: String;
    let keymap: String;
    let hostname: String;
    let username: String;
    let mut postinstall_cmds: Vec<String>;
    let mut postinstall_chroot_cmds: Vec<String>;
    let mut configmaps: Vec<ConfigMap>;

    //Encrypt
    encrypt = yaml["encrypt"].as_bool().expect("Error parsing encrypt");

    //LVM
    let lvm_yaml = yaml["lvm"].as_hash().expect("Error reading lvm config");
    lvm = build_lvm_config(lvm_yaml);

    //Packages
    let packagefile = yaml["packages"]
        .as_str()
        .expect("Error parsing packages config");
    let packages_str = fs::read_to_string(packagefile).expect("Couldnt open package file!");
    packages = build_packages(&packages_str);

    //Timezone
    timezone = yaml["timezone"]
        .as_str()
        .expect("Error parsing timezone")
        .to_string();
    if !Path::new(&format!("/usr/share/zoneinfo/{}", timezone)).exists() {
        panic!(format!("Error timezone {} not found", timezone));
    }

    //Locale
    locale = vec![];
    for i in yaml["locale"].as_vec().expect("msg") {
        locale.push(i.as_str().expect("Error parsing locale").to_string());
    }

    //Lang
    lang = yaml["lang"]
        .as_str()
        .expect("Error parsing lang")
        .to_string();

    //Keymap
    keymap = yaml["keymap"]
        .as_str()
        .expect("Error parsing keymap")
        .to_string();

    //Hostname
    hostname = yaml["hostname"]
        .as_str()
        .expect("Error parsing hostname")
        .to_string();

    username = yaml["username"]
        .as_str()
        .expect("Error parsing username")
        .to_string();

    //postinstall commands
    postinstall_cmds = vec![];
    {
        if yaml["postinstall_cmds"].is_array() {
            let yaml_cmds = yaml["postinstall_cmds"]
                .as_vec()
                .expect("Error parsing postinstall_cmds");
            for cmd in yaml_cmds {
                postinstall_cmds.push(
                    cmd.as_str()
                        .expect("Error parsing postinstall_cmds")
                        .to_string(),
                );
            }
        }
    }

    //postinstall_chroot commands
    postinstall_chroot_cmds = vec![];
    {
        if yaml["postinstall_chroot_cmds"].is_array() {
            let yaml_cmds = yaml["postinstall_chroot_cmds"]
                .as_vec()
                .expect("Error parsing postinstall_chroot_cmds");
            for cmd in yaml_cmds {
                postinstall_chroot_cmds.push(
                    cmd.as_str()
                        .expect("Error parsing postinstall_chroot_cmds")
                        .to_string(),
                );
            }
        }
    }

    //configmap
    configmaps = vec![];
    {
        if yaml["configmaps"].is_array() {
            for map in yaml["configmaps"]
                .as_vec()
                .expect("Error parsing configmaps")
            {
                let path = map["path"].as_str().expect("Error parsing configmap");
                let content = map["content"].as_str().expect("Error parsing config");
                configmaps.push(ConfigMap {
                    path: path.to_string(),
                    content: content.to_string(),
                });
            }
        }
    }

    //Create and return final config struct
    Config {
        encrypt: encrypt,
        hostname: hostname,
        keymap: keymap,
        lang: lang,
        locale: locale,
        lvm: lvm,
        packages: packages,
        timezone: timezone,
        username: username,
        postinstall_cmds: postinstall_cmds,
        postinstall_chroot_cmds: postinstall_chroot_cmds,
        configmaps: configmaps,
    }
}

fn build_lvm_config(lvm_config: &LinkedHashMap<Yaml, Yaml>) -> Vec<LVMPart> {
    let mut parts: Vec<LVMPart> = vec![];
    let mut total = 0;
    for (part_name, info) in lvm_config {
        let name = part_name.as_str().expect("Error Parsing LVM parts");
        let mount = info["mount"]
            .as_str()
            .expect(&format!("Error parsing LVM mountpoint: {}", name));
        let size = info["size"]
            .as_i64()
            .expect(&format!("Error parsing LVM size: {}", name));
        let keep_on_reinstall = info["keep_on_reinstall"]
            .as_bool()
            .expect(&format!("Error parsing LVM keep_on_reinstall: {}", name));

        total += size;
        parts.push(LVMPart {
            name: name.to_string(),
            mount: mount.to_string(),
            size: size,
            keep_on_reinstall: keep_on_reinstall,
        })
    }
    if total > 100 {
        panic!("Error in config: LVM Part sizes over 100%!");
    }
    parts
}

fn build_packages(package_config: &str) -> Vec<String> {
    let mut packages: Vec<String> = vec![];
    for line in package_config.lines() {
        if !line.starts_with("#") && !line.is_empty() {
            for package in line.split(" ").into_iter() {
                if !package.trim().is_empty() {
                    packages.push(package.to_string());
                }
            }
        }
    }
    packages
}
