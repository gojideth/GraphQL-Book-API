require('dotenv').config()
const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const {typeDefs} = require('./typeDefs');
const {resolvers}  = require('./resolvers');
const {connectDB} = require('./db');
const jwt = require('jsonwebtoken');
const find = require('lodash/find');
const expiresIn = '3h' ;
const secret = 'samplejwtauthgraphql';
const tokenPrefix = 'JWT' ;
const createToken = require("./resolvers");
const veriFyToken = require("./resolvers");
const jsonParser = require("body-parser");
const app = express();
connectDB();

module.exports = app;

app.use('/login', jsonParser, (req, res) => {
  if (req.method === 'POST') {
      const token = createToken(req.body.email, req.body.password)
      if (token) { //send successful token
          res.status(200).json({ token })
      } else {
          res.status(403).json({ //no token - invalid credentials
              message: 'Login failed! Invalid credentials!'
          })
      }
  }
});


app.get('/', (req,res)=>{
  res.send('Welcome. Go to /graphql');
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


