import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { Client } from 'pg';


// express
dotenv.config();
const app = express();

app.get("/", (request: Request, response: Response) => { 
  response.status(200).send("Hello World");
}); 

app.listen(process.env.PORT, () => { 
  console.log("Server running at PORT: ", process.env.PORT); 
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});


// pg
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,

  port: parseInt(process.env.DB_PORT)
});

client.connect();
client.query('SELECT NOW()', (err, res) => {
  if (err){
    console.error(err);
  }
  else{
    console.log(res.rows);
  }
  client.end();
});