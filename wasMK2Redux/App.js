import React, { useState } from "react";
import axios from "axios";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import logo from "./wasmk2logo.png";

export default function App() {
  const [msg, setMsg] = useState("Click a button!");
  const [timeoutId, setTimeoutId] = useState();

  const data = (status) => {
    setMsg("Changing Status");
    const data = { password: "ccd98752-bfda-4853-8457-43b8eb86bba8" };
    axios
      .post("http://wasmk2redux.duckdns.org:2724/wifi/" + status, data)
      .then((res) => setMsg(res.data))
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          setMsg(err.response.data);
        } else {
          setMsg(err.message);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setTimeoutId(setTimeout(() => setMsg(""), 5000));
      });
  };

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Image source={logo} style={styles.image}></Image>
        <View style={styles.buttons}>
          <View style={styles.buttonContainer}>
            <Button title="ON" onPress={() => data("on")}></Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="OFF" onPress={() => data("off")}></Button>
          </View>
        </View>
        <Text style={styles.text}>{msg}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "#292B2F",
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: "20%",
    margin: "5%",
    alignItems: "center",
  },

  image: {
    flex: 5,
    maxWidth: "100%",
    resizeMode: "contain",
    marginVertical: 3,
  },
  buttons: {
    flex: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    flex: 1,
    color: "white",
  },

  buttonContainer: {
    margin: 10,
    flex: 1,
  },
});
