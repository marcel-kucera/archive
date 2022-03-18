package de.kucera_server.chatter.server;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Bouncer extends Thread {
    private int port;

    public Bouncer(int port) {
        this.port = port;
    }

    @Override
    public void run() {
        try (ServerSocket ss = new ServerSocket(port)) {
            while (true) {
                Socket client = ss.accept();
                new CodeTalker(client).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
