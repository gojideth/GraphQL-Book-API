const {gql} = require('apollo-server-express');

const typeDefs = gql `
  type Publisher{
    id: ID!
    name:String
    foundationYear: Int
    booksPublished: [Book]
  }
  type Genre{
    name: String
  }
  type Book{
    id: ID!
    title: String
    ISBN: String
    synopsis: String
    publisher:Publisher
    genres: [Genre]
    publicationYear: Int
  }

  type Author{
    id: ID!
    firstName:String
    lastName: String
    country: String
    booksPublished: [Book]
  }

  type Query{
    hello: String
    getAllAuthors: [Author]
  }

  



`;

module.exports = {typeDefs};
