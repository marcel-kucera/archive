import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Branding } from "../../config/branding";
import { Colors } from "../../config/colors";

const HeadingContainer = styled.div`
  display: flex;
`;

const Heading = styled.span`
  margin: auto;
  font-size: 4rem;
  color: ${Colors.TEXT};
  text-decoration: none;
  font-weight: bolder;
  cursor: pointer;
`;

interface HeaderProps {
  onClick?: () => void;
}

export function Header(props: HeaderProps) {
  return (
    <HeadingContainer>
      <Heading onClick={props.onClick}>{Branding.NAME}</Heading>
    </HeadingContainer>
  );
}
