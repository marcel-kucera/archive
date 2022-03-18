package de.kucera_server.chatter.shared.fuckups;

public class NoSuchCommandException extends CommandException {
    public NoSuchCommandException(String cmd) {
        super(cmd + " is not a valid command");
    }
}
