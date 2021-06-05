use std::{
    io::Write,
    process::{Child, Command, ExitStatus, Output, Stdio},
    str::from_utf8,
};

use crate::utils::slice_to_string;

pub fn run_output(exec: &str, args: &[&str]) -> String {
    let mut command = Command::new(exec);
    command.args(args);

    let output = command.output();
    let data: Output;

    match output {
        Ok(d) => {
            command_failed(d.status, exec, args);
            data = d;
        }
        Err(_e) => {
            spawn_failed(exec, args);
            return String::new();
        }
    }
    return from_utf8(&data.stdout)
        .expect(&format!(
            "Unexpected output from [{} {}] Aborting to avoid undefined state!",
            exec,
            slice_to_string(args, " ")
        ))
        .to_owned();
}

pub fn run_terminal(exec: &str, args: &[&str]) {
    let mut command = Command::new(exec);
    command.args(args);

    let output = command.status();

    match output {
        Ok(status) => command_failed(status, exec, &args),
        Err(_e) => spawn_failed(exec, args),
    }
}

pub fn run_with_input(exec: &str, args: &[&str], input: &[&str]) {
    let mut command = Command::new(exec);
    command.args(args);
    command.stdin(Stdio::piped());

    let mut child: Child;
    match command.spawn() {
        Ok(c) => child = c,
        Err(_e) => {
            spawn_failed(exec, args);
            return;
        }
    }

    let stdin = child.stdin.as_mut().expect("Failed to open stdin");
    for i in input.iter() {
        stdin
            .write_all(format!("{}\n", i).as_bytes())
            .expect("Couldnt write to stdin");
    }
    let exitstatus = child
        .wait()
        .expect("Something went wrong with executing a command. Sorry");
    command_failed(exitstatus, exec, args);
}

fn spawn_failed(exec: &str, args: &[&str]) {
    panic!(format!(
        "Couln't run command [{} {}] Aborting to avoid undefined state!",
        exec,
        slice_to_string(args, " "),
    ))
}

fn command_failed(status: ExitStatus, exec: &str, args: &[&str]) {
    if !status.success() {
        panic!(format!(
            "Exit Status of command {} {}: [{}] Aborting to avoid undefined state!",
            exec,
            slice_to_string(args, " "),
            status.code().unwrap()
        ))
    }
}
