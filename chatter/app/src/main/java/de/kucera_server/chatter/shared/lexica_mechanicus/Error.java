package de.kucera_server.chatter.shared.lexica_mechanicus;

import de.kucera_server.chatter.shared.fuckups.CommandException;

public class Error implements ICommand {
    public static final String cmd = "ERROR";
    private String msg;

    public Error(String msg) {
        this.msg = msg;
    }

    public Error(CommandException e) {
        this.msg = e.getMessage();
    }

    @Override
    public String serialize() {
        return String.format("%s;%s", cmd, msg);
    }

    public String getMsg() {
        return msg;
    }

}
