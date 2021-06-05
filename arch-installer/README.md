# Arch-Installer
Install Arch Linux the easy way.

Arch-Installer is an easy and opinionated installer for the Arch Linux distribution.

## Getting started
* Customize the `config.yaml`
* Customize the `packages.txt`
* Copy these and the executable onto a Arch live system
* Run `./arch-installer`

## Building
Build with `cargo build --target=x86_64-unknown-linux-musl --release` to avoid `glibc` dependancy

## Opinions
* System is always on an LVM
* Encryption is done with LVM on LUKS
* `linux` kernel is always used
* `networkmanager` is always used
* all linux partitions are ext4 (may change)

## Config
See the `config.yaml` and `packages.txt` files :P
