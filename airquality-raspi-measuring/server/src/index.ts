import BodyParser from "body-parser";
import Express from "express";
import Api from "./routes/api";

const app = Express();
const port: number = 3000;

app.use(BodyParser.urlencoded({ extended: true }));

app.use(Api);

//Error Handling
app.use((req, res) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  res.sendStatus(500);
});

app.listen(port, () => console.log(`Server is listening on port ${port}`));
