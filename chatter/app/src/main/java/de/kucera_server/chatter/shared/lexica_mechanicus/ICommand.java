package de.kucera_server.chatter.shared.lexica_mechanicus;

import de.kucera_server.chatter.shared.fuckups.CommandException;
import de.kucera_server.chatter.shared.fuckups.NoSuchCommandException;

public interface ICommand {
    public String serialize();

    public static ICommand deserialize(String cmdString) throws CommandException {
        String[] cmd = cmdString.split(";");

        try {
            switch (cmd[0]) {
                case Login.cmd:
                    return new Login(cmd[1], cmd[2]);
                case Register.cmd:
                    return new Register(cmd[1], cmd[2]);
                case Error.cmd:
                    return new Error(cmd[1]);
                case Send.cmd:
                    return new Send(cmd[1]);
                case ChatMsg.cmd:
                    return new ChatMsg(cmd[1], cmd[2], cmd[3]);
                case Ok.cmd:
                    return new Ok();
                default:
                    throw new NoSuchCommandException(cmd[0]);
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            throw new CommandException("missing arguments");
        }
    }
}
