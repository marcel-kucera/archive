package de.kucera_server.chatter.server.stuffs;

import de.kucera_server.chatter.shared.lexica_mechanicus.ChatMsg;

public class Message {
    private String username;
    private String ip;
    private String content;

    public Message(String username, String ip, String content) {
        this.username = username;
        this.ip = ip;
        this.content = content;
    }

    public ChatMsg toCommand() {
        return new ChatMsg(username, ip, content);
    }
}
