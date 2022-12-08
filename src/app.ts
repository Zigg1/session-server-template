import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import cors from 'cors';

import router from "./views/router";

const app=express();
const port=3001;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

console.clear();

mongoose
  .connect('mongodb://127.0.0.1/auth-server-template')
  .then(()=>{
    console.log("Successfully connected to database");
  })
  .catch(err=>{
    console.log("FAILED to connect to database");
    console.error(err);
  });

const oneDay = 1000*60*60*24;
const expireTime = new Date(Date.now() + oneDay);
let sessionConfig = {
  secret: "b89B668V8b88968V6887GBgtGd5BF6ng",
  saveUninitialized: true,
  cookie: {maxAge:oneDay, expires:expireTime},
  resave: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(), collectionName: "sessions"
  })
}

app.use(session(sessionConfig));

app.use('/api', router);

app.use("*", (req,res)=>{
  res.status(404).send("page not found");
});

app.listen(port, ()=>{
  return console.log(`listening to port: ${port}`);
});