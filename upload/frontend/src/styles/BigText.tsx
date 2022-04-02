import { animated } from "@react-spring/web";
import styled from "styled-components";
import { Size } from "../config/media";

export const BigText = styled(animated.span)`
  font-weight: bold;
  text-align: center;

  font-size: 1.2rem;

  margin: auto;

  ${Size.BIG} {
    font-size: 2rem;
  }
`;
