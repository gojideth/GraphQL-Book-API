require('dotenv').config()
const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const {typeDefs} = require('./typeDefs');
const {resolvers}  = require('./resolvers');
const {connectDB} = require('./db');
const jwt = require('jsonwebtoken');
const find = require('lodash/find');
const expiresIn = '3h' // time to live
const secret = 'samplejwtauthgraphql' // secret key
const tokenPrefix = 'JWT' // Prefix for HTTP header

const app = express();
connectDB();

module.exports = app;


app.get('/', (req,res)=>{
  res.send('Welcome to my API');
}); 

async function start(){
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({app});
  app.use("*", (req,res)=>{
    res.status(404).send('Not found')});

  app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
  });
}

start();


