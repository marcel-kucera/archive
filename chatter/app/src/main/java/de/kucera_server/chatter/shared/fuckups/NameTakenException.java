package de.kucera_server.chatter.shared.fuckups;

public class NameTakenException extends CommandException {
    public NameTakenException() {
        super("Name already taken");
    }
}
