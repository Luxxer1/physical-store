import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

export default app;

// import fetch from "node-fetch";

// const response = await fetch("https://viacep.com.br/ws/50930070/json/");
// const data = await response.json();

// console.log(data);
