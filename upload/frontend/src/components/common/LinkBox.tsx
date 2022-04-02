import { useRef } from "react";
import styled from "styled-components";
import { Colors } from "../../config/colors";
import { Size } from "../../config/media";
import { BigText } from "../../styles/BigText";
import { Box } from "../../styles/Box";

const LinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;

  ${Size.BIG} {
    flex-direction: row;
  }
`;

const LinkField = styled.input`
  padding: 1.2rem;
  width: 100%;
  box-sizing: border-box;

  background-color: ${Colors.BG2};
  border-radius: 20px;
  ${Colors.BOXSHADOW}

  border: 0;
  color: ${Colors.TEXT};
`;

const CopyButton = styled.button`
  padding: 1.2rem;
  margin-top: 0.7rem;

  background-color: ${Colors.BG2};
  border-radius: 20px;
  ${Colors.BOXSHADOW}

  border: 0;

  &:active {
    outline: 0.2rem solid ${Colors.ACCENT};
  }

  ${Size.BIG} {
    margin: auto;
    margin-left: 0.7rem;
  }
`;

const CopyIcon = styled.img`
  height: 1rem;
`;

interface LinkBoxProps {
  fileLink: string;
}

export default function LinkBox(props: LinkBoxProps) {
  let linkFieldRef = useRef(null);

  let { fileLink } = props;

  const copyLink = () => {
    linkFieldRef.current.select();
    navigator.clipboard.writeText(linkFieldRef.current.value);
  };

  return (
    <Box style={props.style}>
      <BigText>File Uploaded!</BigText>
      <LinkContainer>
        <LinkField
          type="text"
          value={fileLink}
          readOnly
          onClick={copyLink}
          ref={linkFieldRef}
        ></LinkField>
        <CopyButton onClick={copyLink}>
          <CopyIcon src="/copy.svg" />
        </CopyButton>
      </LinkContainer>
    </Box>
  );
}
