const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    username: String!
    email: String!
    password: String!
    token: String
  }
  type Publisher {
    id: ID!
    name: String
    foundationYear: Int
    booksPublished: [Book]
  }
  type Genre {
    name: String
  }
  type Book {
    id: ID!
    title: String
    ISBN: String
    synopsis: String
    publisher: Publisher
    genres: [Genre]
    publicationYear: Int
    authors: [Author]
  }

  type Author {
    id: ID!
    firstName: String
    lastName: String
    country: String
    booksWritten: [Book]
  }

  type Query {
    """
    Get all the authors
    """
    getAllAuthors: [Author]
    hello: String
    """
    Get all the books, pass order argument to order them
    """
    getAllBooks(order: Int ): [Book]

    """
    Get all the publishers
    """
    getAllPublishers: [Publisher]

    """
    Return an author by its ID
    """
    getAuthorId(id: ID!): Author!

    """
    Return a book by its ID
    """
    getBookId(id: ID!): Book!

    """
    Return a publisher by its ID
    """
    getPublisherId(id: ID!): Publisher!

    getFromIdToObject(id: ID!): Book
      """
      Return the books in a specified order, -1 to descending, by default its ascending
      """
    booksOrdered(order: Int!): [Book]
  }
  input BookInput {
    title: String
    ISBN: String
    synopsis: String
    publisher: InputPublisher
    genres: [InputGenre]
    publicationYear: Int
    authors: [InputAuthor]
  }

  input InputPublisher {
    name: String
    foundationYear: Int
  }
  input InputGenre {
    genres: [String]
  }
  input InputAuthor {
    firstName: String
    lastName: String
    country: String
  }

  input RegisterInput {
    username: String
    email: String
    password: String
  }

  input LoginInput {
    email: String
    password: String
  }

  type Mutation {
    createBook(book: BookInput!): Book!
    updateBook(id: ID!, book: BookInput!): Book!
    deleteBook(id: ID!): String!
    createUser(registerInput: RegisterInput!): User!
    loginUser(loginInput: LoginInput!): User!
  }
`;

module.exports = { typeDefs };
