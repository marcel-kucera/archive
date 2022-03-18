package de.kucera_server.chatter.shared.lexica_mechanicus;

public class Ok implements ICommand {
    public static final String cmd = "OK";

    @Override
    public String serialize() {
        return cmd;
    }

}
