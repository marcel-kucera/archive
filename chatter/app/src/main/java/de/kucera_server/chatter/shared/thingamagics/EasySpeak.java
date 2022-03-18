package de.kucera_server.chatter.shared.thingamagics;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

import de.kucera_server.chatter.shared.fuckups.CommandException;
import de.kucera_server.chatter.shared.fuckups.ConnectionLostException;
import de.kucera_server.chatter.shared.lexica_mechanicus.ICommand;

public class EasySpeak {
    private Socket s;
    private BufferedWriter w;
    private BufferedReader r;

    private boolean debug;

    public EasySpeak(Socket socket) throws IOException {
        s = socket;
        w = new BufferedWriter(new OutputStreamWriter(s.getOutputStream()));
        r = new BufferedReader(new InputStreamReader(s.getInputStream()));
    }

    public ICommand read() throws ConnectionLostException, CommandException {
        while (true) {
            // Read from socket
            String cmdString;
            try {
                cmdString = r.readLine();

            } catch (IOException e) {
                throw new ConnectionLostException();
            }
            if (cmdString == null) {
                throw new ConnectionLostException();
            }

            if (debug)
                System.out.println(cmdString);

            // Parse Command
            ICommand cmd = ICommand.deserialize(cmdString);
            return cmd;

        }
    }

    public void send(ICommand cmd) throws ConnectionLostException {
        String cmdString = cmd.serialize() + "\n";
        if (debug)
            System.out.println(cmdString.trim());
        try {
            w.write(cmdString);
            w.flush();
        } catch (IOException e) {
            throw new ConnectionLostException();
        }
    }

    public void close() {
        try {
            w.close();
            r.close();
            s.close();
        } catch (IOException e) {
        }
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public String getIp() {
        return s.getInetAddress().toString().replace("/", "");
    }
}
