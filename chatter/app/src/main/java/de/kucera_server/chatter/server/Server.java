package de.kucera_server.chatter.server;

public class Server {
    private int port;

    public Server(int port) {
        this.port = port;

    }

    public void start() {
        System.out.println("Starting server thread");

        System.out.println("Preparing Database");
        Intelligence.getInstance().initDB();

        System.out.println("Waiting for connections on port: " + port);

        new Bouncer(port).run();
    }
}
