package de.kucera_server.chatter.shared.lexica_mechanicus;

public class ChatMsg implements ICommand {
    public static final String cmd = "CHATMSG";
    private String sender;
    private String senderIp;
    private String msg;

    public ChatMsg(String sender, String senderIp, String msg) {
        this.sender = sender;
        this.senderIp = senderIp;
        this.msg = msg;
    }

    @Override
    public String serialize() {
        return String.format("%s;%s;%s;%s", cmd, sender, senderIp, msg);
    }

    public String getSender() {
        return sender;
    }

    public String getSenderIp() {
        return senderIp;
    }

    public String getMsg() {
        return msg;
    }
}
