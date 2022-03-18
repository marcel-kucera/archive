package de.kucera_server.chatter.shared.fuckups;

import java.io.IOException;

public class ConnectionLostException extends IOException {
    public ConnectionLostException() {
        super("Connection lost");
    }
}
