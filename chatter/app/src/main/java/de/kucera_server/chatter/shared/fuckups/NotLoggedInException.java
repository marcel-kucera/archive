package de.kucera_server.chatter.shared.fuckups;

public class NotLoggedInException extends CommandException {
    public NotLoggedInException() {
        super("Not logged in");
    }
}
