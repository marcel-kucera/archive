package de.kucera_server.chatter;

import java.io.IOException;
import java.net.UnknownHostException;

import de.kucera_server.chatter.client.Gui;
import de.kucera_server.chatter.server.Server;
import de.kucera_server.chatter.shared.fuckups.CommandException;

public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("Chatter");
        // server();
        boolean isServer = false;
        try {
            if (args[0].equals("server")) {
                isServer = true;
            }
        } catch (Exception ignore) {
        }
        if (isServer) {
            server();
        } else {
            client();
        }
    }

    public static void client() throws UnknownHostException, IOException, CommandException {
        System.out.println("Starting in Client mode");
        new Gui().start();
    }

    public static void server() {
        System.out.println("Starting in Server mode");
        new Server(1337).start();
    }
}
