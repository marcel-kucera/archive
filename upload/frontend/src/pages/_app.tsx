import React from "react";
import { createGlobalStyle } from "styled-components";
import { Colors } from "../config/colors";

const GlobalStyle = createGlobalStyle`
  body{
    min-height: 100vh;
    background-image: url(/cyberbg.png);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    color: ${Colors.TEXT};
    margin: 0;
    font-family: Cantarell;
  }
`;

function MyApp({ Component, pageProps }) {
  return (
    <React.Fragment>
      <GlobalStyle></GlobalStyle>
      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
