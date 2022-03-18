package de.kucera_server.chatter.client;

import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

import de.kucera_server.chatter.shared.fuckups.CommandException;
import de.kucera_server.chatter.shared.fuckups.ConnectionLostException;
import de.kucera_server.chatter.shared.lexica_mechanicus.Error;
import de.kucera_server.chatter.shared.lexica_mechanicus.ICommand;
import de.kucera_server.chatter.shared.lexica_mechanicus.Login;
import de.kucera_server.chatter.shared.lexica_mechanicus.Ok;
import de.kucera_server.chatter.shared.lexica_mechanicus.Register;
import de.kucera_server.chatter.shared.lexica_mechanicus.Send;
import de.kucera_server.chatter.shared.thingamagics.EasySpeak;

public class Client {
    private String host;
    private int port;
    private EasySpeak server;

    public Client(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public void connect() throws UnknownHostException, ConnectionLostException, IOException, CommandException {
        this.server = new EasySpeak(new Socket(host, port));
        server.setDebug(true);
        assertOk();
    }

    public void login(String username, String password) throws ConnectionLostException, CommandException {
        server.send(new Login(username, password));
        assertOk();
    }

    public void register(String username, String password) throws ConnectionLostException, CommandException {
        server.send(new Register(username, password));
        assertOk();
    }

    public void assertOk() throws CommandException, ConnectionLostException {
        ICommand cmd = server.read();
        if (!(cmd instanceof Ok)) {
            if (cmd instanceof Error) {
                throw new CommandException(((Error) cmd).getMsg());
            } else {
                throw new CommandException("Unknown Error: " + cmd.serialize());
            }
        }
    }

    public void sendMessage(String text) throws ConnectionLostException, CommandException {
        server.send(new Send(text));
    }

    public ICommand readServer() throws ConnectionLostException, CommandException {
        ICommand cmd = server.read();
        return cmd;
    }
}