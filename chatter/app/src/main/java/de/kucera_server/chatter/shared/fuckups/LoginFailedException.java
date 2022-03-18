package de.kucera_server.chatter.shared.fuckups;

public class LoginFailedException extends CommandException {
    public LoginFailedException() {
        super("Login failed");
    }
}
