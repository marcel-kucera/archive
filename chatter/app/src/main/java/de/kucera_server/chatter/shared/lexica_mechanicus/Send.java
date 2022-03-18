package de.kucera_server.chatter.shared.lexica_mechanicus;

//Used by to client to send chat messages
public class Send implements ICommand {
    public static final String cmd = "SEND";
    private String msg;

    public Send(String msg) {
        this.msg = msg;
    }

    @Override
    public String serialize() {
        return String.format("%s;%s", cmd, msg);
    }

    public String getMsg() {
        return msg;
    }
}
