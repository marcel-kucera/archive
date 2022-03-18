package de.kucera_server.chatter.shared.fuckups;

public class UserNotFoundException extends CommandException {
    public UserNotFoundException() {
        super("User or password wrong");
    }
}
