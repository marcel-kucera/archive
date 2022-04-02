import { animated } from "@react-spring/web";
import styled from "styled-components";
import { Colors } from "../config/colors";
import { Size } from "../config/media";

export const Box = styled(animated.div)`
  display: flex;
  flex-direction: column;

  padding: 3rem;
  margin: 1rem;

  background-color: ${Colors.BG1};
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

  ${Size.BIG} {
    padding: 5rem;
  }
`;
