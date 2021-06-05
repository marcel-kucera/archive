use core::panic;
use std::{thread::sleep, time::Duration, vec};

use block_devices::{get_device_children, get_device_raw, BlockDevice};
use commands::{run_output, run_terminal, run_with_input};
use config::{build_config, Config, LVMPart};
use utils::{
    append_file, ask_bool_question, ask_continue, create_file, create_file_all, path_exists,
    read_input, read_number, replace_in_file,
};

mod block_devices;
mod commands;
mod config;
mod utils;

fn main() {
    println!("Arch-Installer!\n");

    //read config
    let config: Config = build_config(
        std::fs::read_to_string("config.yaml")
            .expect("Error couldnt find config file (config.yaml)"),
    );

    //Fresh install or reinstall
    let fresh_install = ask_fresh_install();

    //reinstall checks without encryption
    if !fresh_install && !config.encrypt {
        reinstall_check(&config);
    }

    //select the install device
    let device = &select_install_device();

    //partition the disk (fresh install)
    if fresh_install {
        partition(device);
    }

    //selection of partitions
    let (boot_part, efi_part, orig_root_device, efi_format) = select_partitions(device);
    let mut root_device = orig_root_device.to_owned();

    //reinstall checks with encryption
    if !fresh_install && config.encrypt {
        run_terminal("cryptsetup", &["open", &orig_root_device, "disk"]);
        println!("OK!");
        sleep(Duration::from_millis(500));
        reinstall_check(&config);
    }

    //get passwords
    let root_password = ask_root_password();
    let user_password = ask_user_password(&config.username);

    //setup encryption if selected
    if config.encrypt {
        root_device = "/dev/mapper/disk".to_string();
        if fresh_install {
            setup_encryption(&orig_root_device, &ask_enc_password());
        }
    }

    //installation
    println!("Starting installation!");

    match fresh_install {
        true => format_and_mount(&boot_part, &efi_part, &root_device, &config.lvm, efi_format),
        false => reinstall_mount(&boot_part, &efi_part, &config.lvm),
    }

    install_base();

    config_system(config, &root_password, &user_password, &orig_root_device);
    println!("Installation finished");
}

//User interaction required

/*
Step -1: reinstall checks
    checks if the lvm volume group with all logical volumes are present
*/
fn reinstall_check(config: &Config) {
    if !path_exists("/dev/volume") {
        panic!("Error LVM volumegroup volume not found");
    }
    for part in config.lvm.iter() {
        if !path_exists(&format!("/dev/mapper/volume-{}", part.name)) {
            panic!(&format!("LVM volume {} not found", part.name))
        }
    }
}

/*
Step 0: Fresh or reinstall
    Promt the user to select if the system should be reinstalled or fresh installed
*/
fn ask_fresh_install() -> bool {
    loop {
        println!("\nFresh Install or Reinstall?\n");

        println!(" [{}] {}", 1, "Fresh Install");
        println!(" [{}] {}", 2, "Reinstall");

        println!("\nEnter from List:");
        let choice: i32 = read_number();

        match choice {
            1 => return true,
            2 => return false,
            _ => println!("Error: [{}] is not a choice. Try again", choice),
        }

        sleep(Duration::from_millis(500))
    }
}

/*
Step 1: Select Device
    Promt the user to select the block device to create the partitions
    and install the system on
*/
fn select_install_device() -> String {
    loop {
        let device = select_device(&get_device_raw(), "Select the disk to install to:");
        println!("Installing to device: {}", device);
        if ask_continue() {
            return device;
        }
    }
}

/*
Step 2: Create Partitions
    Promt the user to create the partitions with cfdisk
    Required partitions are:
        EFI : Needed to boot from uefi
        Boot: To store the linux kernel unencrypted -> encryption password would need to be entered twice should it be enabled
        Root: To create the LVM (and LUKS encryption) on
*/
fn partition(device: &str) {
    loop {
        println!("Please create the following partitions:\n   EFI Partition (if not present)\n   Boot Partition\n   LVM Partition");
        println!("Press <ENTER> to continue to partitioning in [cfdisk]");
        read_input();
        run_terminal(&"cfdisk".to_string(), &[&device]);

        println!("Patitions:\n");
        sleep(Duration::from_millis(500)); //Wait for table to update
        run_terminal("lsblk", &[device, "-lno", "PATH,SIZE,PARTTYPENAME"]);
        println!("");

        if ask_continue() {
            return;
        }
    }
}

/*
Step 3: Select Partitions
    Promt the user to enter the previously created partitions
    (EFI, Boot, Root)
    Also ask the user if the efi partition should be formatted if FAT32 is found
*/
fn select_partitions(device: &str) -> (String, String, String, bool) {
    let parts = &get_device_children(&device);
    loop {
        let efi_part = select_device(parts, "Select the EFI partition:");
        let boot_part = select_device(parts, "Select the Boot partition:");
        let root_device = select_device(parts, "Select the Root partition:");
        let efi_format = ask_bool_question("Should the EFI partition be formatted?");

        println!("");
        println!("Your selected partitions are:\n");
        println!("EFI   part: {}", efi_part);
        println!("Boot  part: {}", boot_part);
        println!("Root  part: {}", root_device);
        println!("EFI format: {}", efi_format);

        if ask_continue() {
            return (boot_part, efi_part, root_device, efi_format);
        }
    }
}

/*
Step 4: Enter root Password
    Promt the user to enter the root password
*/
fn ask_root_password() -> String {
    ask_password("Enter a password for root:", "Retype password for root:")
}

/*
Step 4.1: Enter user Password
    Promt the user to enter the root password
*/
fn ask_user_password(username: &str) -> String {
    ask_password(
        &format!("Enter a password for {}:", username),
        &format!("Retype password for {}:", username),
    )
}

/*
Step 4.2: Enter encryption Password
    Promt the user to enter the disk encryption password
*/
fn ask_enc_password() -> String {
    ask_password(
        "Enter a disk encryption password:",
        "Retype password for disk encryption:",
    )
}

//Automated

/*
Step 5.1: Create Encryption
    Create encryption should it be enabled and mount it as disk
    and return the Path as string
*/
fn setup_encryption(encrypt_device: &str, password: &str) {
    run_with_input(
        "cryptsetup",
        &["luksFormat", encrypt_device],
        &[&password, &password],
    );
    run_with_input(
        "cryptsetup",
        &["open", encrypt_device, "disk"],
        &[&password],
    );

    if !path_exists("/dev/mapper/disk") {
        panic!("Error couldnt open or create cryptdevice");
    }
}

/*
Step 5.2: Formating and mounting
    Format and mount the partitions
*/
fn format_and_mount(
    boot_part: &str,
    efi_part: &str,
    root_device: &str,
    lvm_parts: &[LVMPart],
    format_efi: bool,
) {
    //Create LVM
    run_terminal("pvcreate", &[root_device]);
    run_terminal("vgcreate", &["volume", root_device]);
    for part in lvm_parts.iter() {
        run_terminal(
            "lvcreate",
            &[
                "-l",
                &format!("{}%VG", part.size),
                "volume",
                "-n",
                &part.name,
            ],
        )
    }

    //Format partitions
    if format_efi {
        run_terminal("mkfs.fat", &["-F32", efi_part]);
    }
    run_terminal("mkfs.ext4", &[boot_part]);
    for part in lvm_parts.iter() {
        run_terminal("mkfs.ext4", &[&format!("/dev/mapper/volume-{}", part.name)])
    }

    //Mount partitions
    for part in lvm_parts.iter() {
        let path = format!("/mnt/{}", part.mount.trim_start_matches("/"));
        mount_with_dir(&format!("/dev/mapper/volume-{}", part.name), &path);
    }

    mount_with_dir(boot_part, "/mnt/boot");
    mount_with_dir(efi_part, "/mnt/boot/efi");
}

/*
Step 5.3: Only mount partitions
    if reinstalling only mount the partitions
*/
fn reinstall_mount(boot_part: &str, efi_part: &str, lvm_parts: &[LVMPart]) {
    //format the the partitions with keep_on_reinstall = false
    for part in lvm_parts.iter() {
        if !part.keep_on_reinstall {
            run_terminal("mkfs.ext4", &[&format!("/dev/mapper/volume-{}", part.name)])
        }
    }

    for part in lvm_parts.iter() {
        let path = format!("/mnt/{}", part.mount.trim_start_matches("/"));
        mount_with_dir(&format!("/dev/mapper/volume-{}", part.name), &path);
    }

    mount_with_dir(boot_part, "/mnt/boot");
    mount_with_dir(efi_part, "/mnt/boot/efi");
}

/*
Step 6: Installing the Base System
    Installs the base system packages and some important utilities
*/
fn install_base() {
    run_terminal(
        "pacstrap",
        &[
            "/mnt",
            "base",
            "linux",
            "linux-firmware",
            "lvm2",
            "networkmanager",
            "nano",
            "grub",
            "efibootmgr",
            "os-prober",
        ],
    )
}

/*Step 7: Config
    Do lots of config:
        fstab
        Enable NetworkManager
        Set Timezone
        Generate and set locale
        Set vconsole keymap
        Set Hostname and hostsfile
        Set root password
        Add required mkinitcpio hooks (keymap,encrypt,lvm2)
        (encryption) grub config
*/
fn config_system(config: Config, root_password: &str, user_password: &str, orig_root_device: &str) {
    //fstab
    {
        let fstab_str = run_output("genfstab", &["-U", "/mnt"]);
        create_file("/mnt/etc/fstab", &fstab_str);
    }

    //enable NetworkManager
    run_chroot_terminal("systemctl", &["enable", "NetworkManager"]);

    //set timezone
    run_chroot_terminal(
        "ln", //Uses terminal instead of rust api because i want to :P
        &[
            "-sf",
            &format!("/usr/share/zoneinfo/{}", config.timezone),
            "/etc/localtime",
        ],
    );

    //generate and set locale
    {
        for locale in config.locale {
            append_file("/mnt/etc/locale.gen", &format!("{}\n", locale));
        }
        run_chroot_terminal("locale-gen", &[""]);

        create_file("/mnt/etc/locale.conf", &format!("LANG={}", config.lang));

        create_file(
            "/mnt/etc/vconsole.conf",
            &format!("KEYMAP={}", config.keymap),
        );
    }

    //set hostname and hosts file
    {
        create_file("/mnt/etc/hostname", &config.hostname);

        create_file(
            "/mnt/etc/hosts",
            &format!(
                "127.0.0.1 localhost\n::1 localhost\n127.0.1.1 {}",
                config.hostname
            ),
        );
    }

    //set root password
    run_chroot_input("passwd", &[], &[&root_password, &root_password]);

    //add required mkinitcpio hooks
    {
        let modules = match config.encrypt {
            false => "lvm2",
            true => "keymap encrypt lvm2",
        };
        replace_in_file(
            "/mnt/etc/mkinitcpio.conf",
            "keyboard",
            &format!("keyboard {}", modules),
        );
        run_chroot_terminal("mkinitcpio", &["-P"]);
    }

    //grub config
    {
        let grub_orig = "GRUB_CMDLINE_LINUX_DEFAULT=\"loglevel=3 quiet\"";
        let cmdline = match config.encrypt {
            true => format!(
                "loglevel=3 cryptdevice=UUID={}:cryptlvm",
                run_output("lsblk", &[orig_root_device, "-dno", "UUID"]).trim()
            ),
            false => "loglevel=3".to_string(),
        };
        let grub_replace = &format!("GRUB_CMDLINE_LINUX_DEFAULT=\"{}\"", cmdline);
        replace_in_file("/mnt/etc/default/grub", grub_orig, grub_replace);
    }

    //install grub
    {
        run_chroot_terminal("grub-install", &[""]);
        run_chroot_terminal("grub-mkconfig", &["-o", "/boot/grub/grub.cfg"]);
    }

    println!("Base system installed. running userconfig");

    //install user package
    {
        let mut pacman_args = vec!["-S".to_string(), "--noconfirm".to_string()];
        pacman_args.append(&mut config.packages.to_owned());
        run_chroot_terminal("pacman", &pacman_args);
    }

    //create user
    {
        run_chroot_terminal("useradd", &["-m", &config.username]);
        run_chroot_input(
            "passwd",
            &[&config.username],
            &[&user_password, &user_password],
        );
        run_chroot_terminal("usermod", &["-aG", "adm,log,sys,wheel,video", &config.username]);
    }

    //create configmaps
    {
        for configmap in config.configmaps {
            create_file_all(&("/mnt".to_owned() + &configmap.path), &configmap.content);
        }
    }

    //run postinstall commands
    {
        for cmd in config.postinstall_cmds {
            run_terminal("bash", &["-c", &cmd])
        }
    }
    //run postinstall-chroot commands
    {
        for cmd in config.postinstall_chroot_cmds {
            run_chroot_terminal("bash", &["-c", &cmd]);
        }
    }
}

//Utilities

fn select_device(list: &Vec<BlockDevice>, title: &str) -> String {
    loop {
        println!("\n{}\n", title);
        for (i, el) in list.iter().enumerate() {
            println!(" [{}] {}\t{}", i + 1, el.path, el.info);
        }

        println!("\nEnter from List:");
        let choice: i32 = read_number();

        let selected = list.get((choice - 1) as usize);
        match selected {
            Some(el) => return el.path.to_string(),
            None => println!("Error: [{}] is not a choice. Try again", choice),
        }

        sleep(Duration::from_millis(500))
    }
}

fn run_chroot_terminal<T: AsRef<str>>(exec: &str, args: &[T]) {
    let mut args_fin = vec!["/mnt"];
    args_fin.push(exec);
    for arg in args.iter() {
        args_fin.push(arg.as_ref());
    }
    run_terminal("arch-chroot", &args_fin);
}

fn run_chroot_input(exec: &str, args: &[&str], input: &[&str]) {
    let mut args_fin = vec!["/mnt"];
    args_fin.push(exec);
    args_fin.append(&mut args.to_owned());
    run_with_input("arch-chroot", &args_fin, input);
}

fn ask_password(msg1: &str, msg2: &str) -> String {
    loop {
        println!("{}", msg1);
        let pass = rpassword::read_password().unwrap();
        println!("{}", msg2);
        let pass_check = rpassword::read_password().unwrap();

        if pass == pass_check {
            println!("Password OK!");
            return pass;
        } else {
            println!("Sorry, passwords do not match. Try again");
        }
    }
}

fn mount_with_dir(device: &str, path: &str) {
    let create_dir = std::fs::create_dir_all(path);
    if create_dir.is_err() {
        if create_dir.unwrap_err().kind() != std::io::ErrorKind::AlreadyExists {
            panic!(&format!("Error mountpoint {} could not be created", path));
        }
    }
    run_terminal("mount", &[device, path]);
}
