import { NextPage } from "next";
import { ChangeEvent, useState } from "react";
import styled from "styled-components";
import { RelicList } from "../components/relicList";
import { RelicListModel } from "../data/relicsModel";

const Container = styled.div`
  margin: 1rem;
  display: flex;
  flex-direction: column;
`;

const UploadBox = styled.div``;

const RelicListContainer = styled.div`
  margin: 0.5rem;
  display: flex;
`;

const Home: NextPage = () => {
  const [file, setFile] = useState<File>();
  const [list, setList] = useState<RelicListModel>(new RelicListModel());

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files == null) {
      console.error("fuck2");
      return;
    }
    setFile(e.target.files[0]);
  };

  const upload = async () => {
    let r = await file?.text();
    if (r == undefined) {
      console.error("fuck1");
      return;
    }
    let listJSON: RelicListModel = JSON.parse(r);
    setList(listJSON);
    console.log(listJSON);
  };

  const update = (
    era: "lith" | "meso" | "neo" | "axi",
    index: number,
    amount: number
  ) => {
    let newList = list;
    newList[era][index].amount = amount;
    setList({ ...newList });
  };

  return (
    <Container>
      <UploadBox>
        <input
          type="file"
          id="upload"
          name="upload"
          onChange={handleFile}
        ></input>
        <br />
        {file ? <button onClick={upload}>Import</button> : null}
        <a
          download="relics.json"
          href={
            "data:application/json," + encodeURIComponent(JSON.stringify(list))
          }
        >
          Export
        </a>
      </UploadBox>

      <h1>Relic List</h1>
      <RelicListContainer>
        <RelicList data={list.lith} era="lith" update={update} />
        <RelicList data={list.meso} era="meso" update={update} />
        <RelicList data={list.neo} era="neo" update={update} />
        <RelicList data={list.axi} era="axi" update={update} />
      </RelicListContainer>
    </Container>
  );
};

export default Home;
