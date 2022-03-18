package de.kucera_server.chatter.server;

import java.io.IOException;
import java.net.Socket;
import java.sql.SQLException;
import java.util.ArrayList;

import de.kucera_server.chatter.server.stuffs.Message;
import de.kucera_server.chatter.server.stuffs.User;
import de.kucera_server.chatter.shared.fuckups.CommandException;
import de.kucera_server.chatter.shared.fuckups.ConnectionLostException;
import de.kucera_server.chatter.shared.fuckups.DatabaseException;
import de.kucera_server.chatter.shared.fuckups.NameTakenException;
import de.kucera_server.chatter.shared.fuckups.NotLoggedInException;
import de.kucera_server.chatter.shared.fuckups.UserNotFoundException;
import de.kucera_server.chatter.shared.lexica_mechanicus.ChatMsg;
import de.kucera_server.chatter.shared.lexica_mechanicus.Error;
import de.kucera_server.chatter.shared.lexica_mechanicus.ICommand;
import de.kucera_server.chatter.shared.lexica_mechanicus.Login;
import de.kucera_server.chatter.shared.lexica_mechanicus.Ok;
import de.kucera_server.chatter.shared.lexica_mechanicus.Register;
import de.kucera_server.chatter.shared.lexica_mechanicus.Send;
import de.kucera_server.chatter.shared.thingamagics.EasySpeak;

public class CodeTalker extends Thread {
    private static final int catchupAmount = 100;
    private EasySpeak client;
    private Mailman mailman;
    private Intelligence intel;
    private User user;

    public CodeTalker(Socket client) throws IOException {
        this.client = new EasySpeak(client);
        this.client.setDebug(true);
        this.intel = Intelligence.getInstance();
        this.mailman = Mailman.getInstance();
    }

    @Override
    public void run() {

        try {
            sendOk();
            while (true) {
                try {
                    ICommand cmd = client.read();
                    if (user == null) {
                        user = preAuthCmd(cmd);
                    } else {
                        runCmd(cmd);
                    }
                } catch (CommandException e) {
                    client.send(new Error(e));
                } catch (SQLException e) {
                    e.printStackTrace();
                    client.send(new Error(new DatabaseException()));
                }
            }
        } catch (ConnectionLostException e) {
        } finally {
            cleanup();
        }
    }

    private User preAuthCmd(ICommand cmd) throws CommandException, ConnectionLostException, SQLException {
        if (cmd instanceof Login) {
            user = login((Login) cmd);
        } else if (cmd instanceof Register) {
            user = register((Register) cmd);
        } else {
            throw new NotLoggedInException();
        }
        sendOk();
        catchUp(catchupAmount);
        mailman.add(this);
        return user;
    }

    private void catchUp(int amount) throws SQLException, ConnectionLostException {
        ArrayList<Message> messages = intel.getLastMessages(amount);
        for (int i = messages.size() - 1; i >= 0; i--) {
            send(messages.get(i).toCommand());
        }
    }

    private User login(Login loginCmd) throws NameTakenException, UserNotFoundException, SQLException {
        String name = loginCmd.getName();
        String pass = loginCmd.getPassword();
        User user = intel.loginUser(name, pass);
        return user;
    }

    private User register(Register registerCmd) throws UserNotFoundException, SQLException, NameTakenException {
        String name = registerCmd.getUsername();
        String pass = registerCmd.getPassword();
        User user = intel.createUser(name, pass);
        return user;
    }

    public void send(ICommand cmd) throws ConnectionLostException {
        if (user != null) {
            client.send(cmd);
        }
    }

    private void runCmd(ICommand cmd) throws SQLException {
        if (cmd instanceof Send) {
            String ip = this.client.getIp();
            Send send = (Send) cmd;

            intel.newMessage(this.user, ip, send.getMsg());
            ChatMsg msg = new ChatMsg(this.user.getName(), ip, send.getMsg());
            this.mailman.broadcast(msg);
        }
    }

    public void cleanup() {
        mailman.remove(this);
        client.close();
    }

    private void sendOk() throws ConnectionLostException {
        this.client.send(new Ok());
    }

    public User getUser() {
        return user;
    }
}