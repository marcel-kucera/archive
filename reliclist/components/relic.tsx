import styled from "styled-components";
import { RelicModel } from "../data/relicsModel";

const Container = styled.div`
  padding: 0.5rem;
  margin: 0.2rem;
  border-radius: 5px;
  background-color: gray;
  display: flex;
`;

const Label = styled.div`
  font-size: 2rem;
  margin: auto;
`;

const ButtonContainer = styled.div`
  margin: auto;
  margin-right: 0px;
`;

const Button = styled.button`
  margin: auto;
  height: 2rem;
  width: 2rem;
  margin: 0.2rem;
  border: 0px;
  border-radius: 3px;
  font-size: 1.5rem;
`;

interface IRelic {
  data: RelicModel;
  updateFunc: (amount: number) => void;
}

export const Relic = (props: IRelic) => {
  let Buttons = () => (
    <ButtonContainer>
      <Button onClick={() => props.updateFunc(data.amount + 1)}>+</Button>
      <Button onClick={() => props.updateFunc(data.amount - 1)}>-</Button>
    </ButtonContainer>
  );
  const data = props.data;
  return (
    <Container>
      <Label>{data.id}</Label>
      <Label>x{data.amount}</Label>
      <Buttons></Buttons>
    </Container>
  );
};
