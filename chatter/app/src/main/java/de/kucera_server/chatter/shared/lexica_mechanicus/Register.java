package de.kucera_server.chatter.shared.lexica_mechanicus;

public class Register implements ICommand {
    public static final String cmd = "REGISTER";
    private String username;
    private String password;

    public Register(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @Override
    public String serialize() {
        return String.format("%s;%s;%s", cmd, username, password);
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

}
