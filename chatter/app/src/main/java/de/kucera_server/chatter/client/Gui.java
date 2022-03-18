package de.kucera_server.chatter.client;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.UnsupportedLookAndFeelException;
import javax.swing.WindowConstants;

import com.formdev.flatlaf.FlatDarculaLaf;

import de.kucera_server.chatter.shared.actuallyfuckingstolen.StreetSmarts;
import de.kucera_server.chatter.shared.fuckups.CommandException;
import de.kucera_server.chatter.shared.fuckups.ConnectionLostException;
import de.kucera_server.chatter.shared.lexica_mechanicus.ChatMsg;
import de.kucera_server.chatter.shared.lexica_mechanicus.Error;
import de.kucera_server.chatter.shared.lexica_mechanicus.ICommand;
import net.miginfocom.swing.MigLayout;

public class Gui {
    Client client;

    public void start() {
        openLoginWindow();
    }

    public Gui() {
        try {
            UIManager.setLookAndFeel(new FlatDarculaLaf());
        } catch (UnsupportedLookAndFeelException e) {
            // Ignore
            e.printStackTrace();
        }
    }

    private void openLoginWindow() {
        // Frame
        JFrame f = new JFrame();
        f.setTitle("Chatter Login");
        f.setSize(500, 300);
        f.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        f.setLayout(new MigLayout());

        // Host
        JLabel hostText = new JLabel("Server:");
        JTextField hostField = new JTextField();

        // Port
        JLabel portText = new JLabel("Port:");
        JTextField portField = new JTextField();

        // Username
        JLabel usernameText = new JLabel("Username:");
        JTextField usernameField = new JTextField();

        // Password
        JLabel passwordText = new JLabel("Password:");
        JTextField passwordField = new JTextField();

        // Spacer
        JPanel spacer = new JPanel();

        // Loginbutton
        JButton loginButton = new JButton("Login");

        // Registerbutton
        JButton registerButton = new JButton("Register");

        // Actions
        ActionListener loginAction = (ActionEvent event) -> {
            new Thread(() -> {
                loginButton.setEnabled(false);
                try {
                    // Get data from fields
                    String host = hostField.getText();
                    int port = 0;
                    try {
                        port = Integer.parseInt(portField.getText());
                    } catch (NumberFormatException e) {
                        showPopup("Port is not a number");
                        return;
                    }
                    String username = usernameField.getText();
                    String password = passwordField.getText();

                    // Connect to server
                    this.client = new Client(host, port);
                    try {
                        client.connect();
                        client.login(username, password);
                        f.dispose();
                        openMainWindow();

                    } catch (IOException e) {
                        showPopup("Failed to connect to server");
                        return;
                    } catch (CommandException e) {
                        showPopup("Failed to connect to server: " + e.getMessage());
                        return;
                    }
                } finally {
                    loginButton.setEnabled(true);
                }
            }).start();
            ;
        };
        loginButton.addActionListener(loginAction);

        ActionListener registerAction = (ActionEvent event) -> {
            new Thread(() -> {
                registerButton.setEnabled(false);
                try {
                    // Get data from fields
                    String host = hostField.getText();
                    int port = 0;
                    try {
                        port = Integer.parseInt(portField.getText());
                    } catch (NumberFormatException e) {
                        showPopup("Port is not a number");
                        return;
                    }
                    String username = usernameField.getText();
                    String password = passwordField.getText();

                    // Connect to server
                    this.client = new Client(host, port);
                    try {
                        client.connect();
                        client.register(username, password);
                        f.dispose();
                        openMainWindow();

                    } catch (IOException e) {
                        showPopup("Failed to connect to server");
                        return;
                    } catch (CommandException e) {
                        showPopup("Failed to connect to server: " + e.getMessage());
                        return;
                    }
                } finally {
                    registerButton.setEnabled(true);
                }
            }).start();
            ;
        };
        registerButton.addActionListener(registerAction);

        // Add to frame
        f.add(hostText);
        f.add(hostField, "w :100%:, wrap");

        f.add(portText);
        f.add(portField, "w :100%:, wrap");

        f.add(usernameText);
        f.add(usernameField, "w :100%:, wrap");

        f.add(passwordText);
        f.add(passwordField, "w :100%:, wrap");

        f.add(spacer, "h :100%:, wrap");

        f.add(loginButton, "w :100%:");
        f.add(registerButton, "w :100%:");

        // Show
        f.setVisible(true);
    }

    private void openMainWindow() {

        // Frame
        JFrame f = new JFrame();
        f.setTitle("Chatter");
        f.setSize(1000, 700);
        f.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        f.setLayout(new MigLayout("", "grow6"));

        // Chat text
        JTextArea chatText = new JTextArea();
        chatText.setEditable(false);
        JScrollPane chat = new JScrollPane(chatText);
        new StreetSmarts(chat);

        // Chat field
        JPanel chatField = new JPanel();
        chatField.setLayout(new MigLayout());
        JTextField msgField = new JTextField();
        JButton sendButton = new JButton("Send");
        chatField.add(msgField, "w :100%:");
        chatField.add(sendButton);

        // Actions
        ActionListener sendAction = (ActionEvent event) -> {
            SwingUtilities.invokeLater(() -> {
                try {
                    client.sendMessage(msgField.getText());
                    msgField.setText("");
                } catch (CommandException e) {
                    showPopup("Failed to send message");
                } catch (ConnectionLostException e) {
                    showPopup("Connection Lost");
                }
            });
        };
        msgField.addActionListener(sendAction);
        sendButton.addActionListener(sendAction);

        // Add to frame
        f.add(chat, "grow,h :100%:,w :100%:,wrap");
        f.add(chatField, "span,grow");

        // Show
        f.setVisible(true);
        msgField.requestFocus();

        // Server command listener
        new Thread(() -> {
            while (true) {
                try {
                    ICommand cmd = client.readServer();
                    if (cmd instanceof ChatMsg) {
                        ChatMsg msg = (ChatMsg) cmd;
                        SwingUtilities.invokeLater(() -> {
                            chatText.append(
                                    String.format("%s@%s: %s\n", msg.getSender(), msg.getSenderIp(), msg.getMsg()));
                        });
                    } else if (cmd instanceof Error) {
                        Error err = (Error) cmd;
                        showPopup("Server error: " + err.getMsg());
                    }
                } catch (ConnectionLostException e) {
                    showPopup("Connection with server lost");
                    System.exit(0);
                } catch (CommandException e) {
                    showPopup("I have no idea what the server is talking about");
                }
            }
        }).start();

    }

    private void showPopup(String text) {
        JOptionPane.showMessageDialog(new JFrame(), text);
    }
}
