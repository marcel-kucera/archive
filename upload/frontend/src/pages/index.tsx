import { animated, config, useTransition } from "@react-spring/web";
import React, { useState } from "react";
import styled from "styled-components";
import { FileBox } from "../components/common/FileBox";
import LinkBox from "../components/common/LinkBox";
import UploadBox from "../components/common/UploadBox";
import { Header } from "../components/layout/Header";
import { downloadUrl } from "../config/api";

const BoxContainer = styled.div`
  margin: auto;
  padding: 0.7rem;

  margin-top: 15vh;
`;

const FlexRoot = styled.div`
  display: flex;
  flex-direction: column;
`;

export default function Home() {
  const [stage, setStage] = useState(0);
  const [uploadFile, setUploadFile] = useState<File>();
  const [fileLink, setFileLink] = useState<string>();

  const fileSelected = (file: File) => {
    setUploadFile(file);
    setStage(1);
  };

  const onUploadDone = (id: string) => {
    setFileLink(downloadUrl(id));
    setStage(2);
  };

  const stages = [
    <FileBox onSelect={fileSelected} />,
    <UploadBox file={uploadFile} onUploadDone={onUploadDone} />,
    <LinkBox fileLink={fileLink} />,
  ];

  const trans = useTransition(stage, {
    initial: { position: "relative" },
    from: {
      bottom: "100px",
      opacity: "0",
    },
    enter: {
      bottom: "0",
      opacity: "1",
    },
    leave: {
      bottom: "-100px",
      opacity: "0",
    },
    exitBeforeEnter: true,
    config: {
      ...config.wobbly,
      restVelocity: 100,
    },
  });

  return (
    <FlexRoot>
      <Header onClick={() => setStage(0)} />
      <BoxContainer>
        {trans((style, stage) => (
          <animated.div
            style={{
              ...style,
              position: "relative",
            }}
          >
            {stages[stage]}
          </animated.div>
        ))}
      </BoxContainer>
    </FlexRoot>
  );
}
