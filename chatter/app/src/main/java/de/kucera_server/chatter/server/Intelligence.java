package de.kucera_server.chatter.server;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import de.kucera_server.chatter.server.stuffs.Message;
import de.kucera_server.chatter.server.stuffs.User;
import de.kucera_server.chatter.shared.fuckups.NameTakenException;
import de.kucera_server.chatter.shared.fuckups.UserNotFoundException;

public class Intelligence {
    private static Intelligence instance;
    private Connection conn;

    private Intelligence() {
        try {
            this.conn = DriverManager.getConnection("jdbc:sqlite:sample.db");
        } catch (Exception e) {
            System.err.println("DB fucked up");
            System.exit(1);
        }
    }

    public static Intelligence getInstance() {
        if (instance == null) {
            instance = new Intelligence();
        }
        return instance;
    }

    public void initDB() {
        String usersTable = "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, name VARCHAR(80) UNIQUE, password VARCHAR(80));";
        String messagesTable = "CREATE TABLE IF NOT EXISTS message (id INTEGER PRIMARY KEY, user INTEGER, ip VARCHAR(80), content VARCHAR(255), time DATETIME, FOREIGN KEY (user) REFERENCES user(id))";
        try {
            conn.createStatement().execute(usersTable);
            conn.createStatement().execute(messagesTable);

        } catch (SQLException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    public User createUser(String username, String password)
            throws SQLException, UserNotFoundException, NameTakenException {
        PreparedStatement st = conn.prepareStatement("INSERT INTO user (name,password) VALUES (?,?)");
        st.setString(1, username);
        st.setString(2, password);
        try {
            st.execute();
        } catch (SQLException e) {
            if (e.getErrorCode() == 19) {
                throw new NameTakenException();
            } else {
                throw e;
            }
        }

        return loginUser(username, password);
    }

    public User loginUser(String username, String password) throws SQLException, UserNotFoundException {
        PreparedStatement st = conn.prepareStatement("SELECT * FROM user WHERE name=? AND password=?");
        st.setString(1, username);
        st.setString(2, password);
        ResultSet rs = st.executeQuery();
        if (!rs.next()) {
            throw new UserNotFoundException();
        }
        int id = rs.getInt("id");
        String name = rs.getString("name");
        String pass = rs.getString("password");
        return new User(id, name, pass);
    }

    public void newMessage(User user, String ip, String message) throws SQLException {
        PreparedStatement st = conn.prepareStatement(
                "INSERT INTO message (user,ip,content,time) VALUES (?,?,?,strftime('%Y-%m-%d %H-%M-%S','now'))");
        st.setInt(1, user.getId());
        st.setString(2, ip);
        st.setString(3, message);
        st.execute();
    }

    public ArrayList<Message> getLastMessages(int amount) throws SQLException {
        PreparedStatement st = conn.prepareStatement(
                "SELECT u.name, m.ip, m.content FROM message AS m JOIN user AS u ON u.id=m.user ORDER BY time DESC LIMIT ?");
        st.setInt(1, amount);
        ResultSet rs = st.executeQuery();
        ArrayList<Message> messages = new ArrayList<>();
        while (rs.next()) {
            messages.add(new Message(rs.getString("name"), rs.getString("ip"), rs.getString("content")));
        }
        return messages;
    }
}
