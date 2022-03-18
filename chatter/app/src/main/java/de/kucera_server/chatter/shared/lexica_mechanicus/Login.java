package de.kucera_server.chatter.shared.lexica_mechanicus;

public class Login implements ICommand {
    public static final String cmd = "LOGIN";
    private String name;
    private String password;

    public Login(String name, String password) {
        this.name = name;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String serialize() {
        return String.format("%s;%s;%s", cmd, name, password);
    }
}
