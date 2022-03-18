package de.kucera_server.chatter.server.stuffs;

public class User {
    private int id;
    private String name;
    private String password;

    public User(int id, String username, String password) {
        this.id = id;
        this.name = username;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public int getId() {
        return id;
    }
}