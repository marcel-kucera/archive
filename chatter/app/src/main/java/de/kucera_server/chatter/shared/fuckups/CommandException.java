package de.kucera_server.chatter.shared.fuckups;

public class CommandException extends Exception {
    public CommandException(String errorMessage) {
        super(errorMessage);
    }

    public CommandException() {
        super();
    }
}
