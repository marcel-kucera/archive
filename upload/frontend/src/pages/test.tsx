import { animated, config, useTransition } from "@react-spring/web";
import { useState } from "react";
import styled from "styled-components";
import { Header } from "../components/layout/Header";
import { Colors } from "../config/colors";

const Container = styled.div`
  padding: 200px;
`;

const Clicker = styled.div`
  background-color: ${Colors.BG1};
  text-align: center;
  border-radius: 20px;
  padding: 20px;
  font-size: xx-large;
  margin: 2rem;
  user-select: none;
  display: flex;
  flex-direction: column;
`;

const PopOverContainer = styled.div`
  margin: auto;
`;

const PopOver = styled(animated.div)`
  background-color: ${Colors.BG2};
  text-align: center;
  border-radius: 20px;
  padding: 20px;
  font-size: xx-large;
  user-select: none;
  position: absolute;
  transform: translate(-50%, -100%);
  ${Colors.BOXSHADOW}
`;

export default function Test() {
  const [show, set] = useState(false);

  const trans = useTransition(show, {
    from: { transform: "translate(-50%,-150%)", opacity: 0 },
    enter: { transform: "translate(-50%,-100%)", opacity: 1 },
    leave: { transform: "translate(-50%,-150%)", opacity: -0.5 },
    config: {
      restVelocity: 100,
    },
  });

  const stuff = () => {
    set(!show);
    console.log(show);
  };

  return (
    <Container>
      <Header></Header>
      <Clicker onClick={stuff}>
        <PopOverContainer>
          {trans(
            (style, item) =>
              item && <PopOver style={style}>hellow guy </PopOver>
          )}
        </PopOverContainer>
        <span>hello!</span>
      </Clicker>
    </Container>
  );
}
