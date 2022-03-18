package de.kucera_server.chatter.shared.fuckups;

public class DatabaseException extends CommandException {
    public DatabaseException() {
        super("Database failure");
    }
}
