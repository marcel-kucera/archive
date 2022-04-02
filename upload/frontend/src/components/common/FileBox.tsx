import React from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Colors } from "../../config/colors";
import { BigText as BigText } from "../../styles/BigText";
import { Box } from "../../styles/Box";

interface UploadBoxSProps {
  dragging: boolean;
}

const UploadBoxContainer = styled(Box)<UploadBoxSProps>`
  border: dashed 0.5rem ${Colors.BG2};
  border-color: ${(props) => (props.dragging ? Colors.ACCENT : null)};
  cursor: pointer;
`;

const Icon = styled.img`
  margin: auto;

  width: 7rem;
  margin-bottom: 2rem;
`;

interface FileBoxProps {
  onSelect: (file: File) => void;
}

export function FileBox(props: FileBoxProps) {
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length == 1) {
      props.onSelect(acceptedFiles[0]);
    } else {
      throw "something weird happend with the files";
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <UploadBoxContainer {...getRootProps()} dragging={isDragActive}>
      <Icon src="/upload.svg"></Icon>
      <BigText>Drag or Click to Upload File</BigText>
      <input {...getInputProps()}></input>
    </UploadBoxContainer>
  );
}
