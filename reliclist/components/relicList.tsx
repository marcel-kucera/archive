import styled from "styled-components";
import { RelicModel } from "../data/relicsModel";
import { Relic } from "./relic";

interface IRelicList {
  era: "lith" | "meso" | "neo" | "axi";
  update: (
    era: "lith" | "meso" | "neo" | "axi",
    index: number,
    amount: number
  ) => void;
  data: RelicModel[];
}

const Container = styled.div`
  width: 100%;
`;

const Title = styled.div`
  text-transform: capitalize;
  font-weight: bold;
  font-size: 2rem;
`;

export const RelicList = (props: IRelicList) => {
  const updateFactory = (index: number) => {
    return (amount: number) => {
      if (amount < 0) return;
      props.update(props.era, index, amount);
    };
  };

  return (
    <Container>
      <Title>{props.era}</Title>
      {props.data.map((e, i) => (
        <Relic data={e} updateFunc={updateFactory(i)} key={e.id} />
      ))}
    </Container>
  );
};
