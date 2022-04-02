import { animated, useSpring } from "@react-spring/web";
import axios, { Axios } from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Colors } from "../../config/colors";
import { upload } from "../../services/uploadService";
import { BigText } from "../../styles/BigText";
import { Box } from "../../styles/Box";

const ProgressBar = styled.div`
  margin: 1.5rem auto;
  background-color: ${Colors.BG2};
  height: 3rem;
  width: 15rem;
  border-radius: 20px;
  overflow: hidden;
  ${Colors.BOXSHADOW}
`;

const Progress = styled(animated.div)`
  height: 100%;
  border-radius: 20px;
  background-color: ${Colors.ACCENT};
`;

interface UploadBoxProps {
  file: File;
  onUploadDone: (id: string) => void;
}

export default function UploadBox(props: UploadBoxProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();

  useEffect(() => {
    //Cancel request on returning to main page
    const cancelToken = axios.CancelToken.source();

    const req = upload(props.file, {
      onUploadProgress: (e) => {
        setProgress((e.loaded / e.total) * 100);
      },
      cancelToken: cancelToken.token,
    });

    req
      .then((res) => setTimeout(() => props.onUploadDone(res.data), 500))
      .catch((e) => setError(e));

    //Returned function is called on unmount
    return () => {
      cancelToken.cancel();
    };
  }, []);

  const progAnim = useSpring({
    from: { width: "0%", progA: 0 },
    to: { width: progress + "%", progA: progress },
  });

  return (
    <Box>
      <BigText>Uploading!</BigText>
      <ProgressBar>
        <Progress style={progAnim}></Progress>
      </ProgressBar>
      <BigText>
        {error
          ? error.toString()
          : progAnim.progA.to((n) => n.toFixed(0) + "%")}
      </BigText>
    </Box>
  );
}
