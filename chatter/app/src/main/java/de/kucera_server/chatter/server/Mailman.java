package de.kucera_server.chatter.server;

import java.util.ArrayList;

import de.kucera_server.chatter.shared.fuckups.ConnectionLostException;
import de.kucera_server.chatter.shared.lexica_mechanicus.ICommand;

public class Mailman {
    private ArrayList<CodeTalker> clients;
    private static Mailman instance;

    private Mailman() {
        clients = new ArrayList<>();
    }

    public static Mailman getInstance() {
        if (instance == null) {
            instance = new Mailman();
        }
        return instance;
    }

    public void add(CodeTalker client) {
        clients.add(client);
    }

    public void remove(CodeTalker client) {
        clients.remove(client);
    }

    public void broadcast(ICommand cmd) {
        for (CodeTalker client : clients) {
            try {
                client.send(cmd);
            } catch (ConnectionLostException e) {
                client.cleanup();
            }
        }
    }
}
