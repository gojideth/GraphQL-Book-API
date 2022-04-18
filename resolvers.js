const { getArgumentValues } = require("@graphql-tools/utils");
const { ApolloError } = require("apollo-server-express");
const mongoose = require("mongoose");
const Author = require("./src/models/Author");
const Book = require("./src/models/Book");
const Publisher = require("./src/models/Publisher");
const User = require("./src/models/User");
const typeDb = require("mongoose").Types;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createAuthor = (author) => {
  return Author.create(author).then((author) => {
    console.log(`Tutorial created ${author}`);
    return author;
  });
};

const createPublisher = (publisher) => {
  return Publisher.create(publisher).then((publisher) => {
    console.log(`Publisher created ${publisher}`);
    return publisher;
  });
};

//Para crear un libro necesito el nombre de la editorial para asi poder agregarselo, con el nombre busco el id y lo agrego como atributo.
const createBook = function (publisherId, book) {
  return Book.create(book).then((docBook) => {
    console.log("\n>> Created Book:\n", docBook);
    return Publisher.findByIdAndUpdate(
      publisherId,
      { $push: { booksPublished: docBook._id } },
      { new: true, useFindAndModify: false }
    );
  });
};

const output = async () => {
  var publisher = await Publisher.find({ name: "Panamericana" }, { _id: 1 });
  console.log(publisher);
  var books = await Book.find({ publisher: publisher });
  console.log(books);
};

const resolvers = {
  Query: {
    hello: async () => {
      const string = await Author.findById("625b2e074b3bdb0359ab4863");
      console.log(string.firstName);
      return string;
    },
    getAllAuthors: async () => {
      const authors = await Author.find();
      return authors;
    },
    getAllBooks: async (args) => {
      const books = await Book.find();
      return books;
    },
    getAllPublishers: async (root, args) => {
      console.log(root);
      const publishers = await Publisher.find();
      return publishers;
    },
    getAuthorId: async (_, args) => {
      console.log(args.id);
      const author = await Author.findById(args.id);
      return author;
    },
    getBookId: async (_, args) => {
      console.log(args.id);
      const book = await Book.findById(args.id);
      return book;
    },
    getPublisherId: async (_, args) => {
      console.log(args.id);
      const publisher = await Publisher.findById(args.id);
      return publisher;
    },
    getFromIdToObject: async (root, args) => {
      console.log(root.Publisher);
      return root;
    },
    books: (parent, args, context, info) => {},
  },
  Mutation: {
    createBook: async (root, args) => {
      const newBook = await validatePublisherBook(args);
      return newBook;
    },
    updateBook: async (_, { id, book }) => {
      const bookUpdated = await Book.findByIdAndUpdate(
        id,
        {
          $set: book,
        },
        { new: true }
      );
      return bookUpdated;
    },
    deleteBook: async (_, { id }) => {
      await Book.findByIdAndRemove(id);
      return `Book with ID ${id} deleted`;
    },
    async createUser(_, { registerInput: { username, email, password } }) {
      const oldUser = await User.findOne({ email });
      if (oldUser) {
        throw new ApolloError(
          `User already created with that email ${email}`,
          "USER_ALREADY_EXISTS"
        );
      }
      var encryptedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: encryptedPassword,
      });
      const token = jwt.sign({ user_id: newUser._id, email }, "UNSAFE_STRING", {
        expiresIn: "2h",
      });
      newUser.token = token;
      const res = await  newUser.save();
      return {
        id: res.id,
        ...res._doc,
      };
    },
    loginUser: async (_, { loginInput: { email, password } }) => {
      const user = await User.findOne({email});
      console.log(user);
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ user_id: user._id, email }, "UNSAFE_STRING", {
          expiresIn: "2h",
        });
        user.token = token;
        return {
          id: user.id,
          ...user._doc,
        };
      } else {
        throw new ApolloError("Incorrect password", "INCORRECT_PASSWORD");
      }
    },
  },
};




async function linkNewBookToPublisher(bookId, publisherId) {
  return await Publisher.findByIdAndUpdate(
    publisherId,
    { $push: { booksPublished: bookId._id } },
    { new: true, useFindAndModify: false }
  );
}
async function linkNewBookToAuthor(bookId, authorId) {
  return await Author.findByIdAndUpdate(
    authorId,
    { $push: { booksWritten: bookId._id } },
    { new: true, useFindAndModify: false }
  );
}

async function linkAuthorToBook(bookId, authorId) {
  return await Book.findByIdAndUpdate(
    bookId,
    { $push: { authors: authorId._id } },
    { new: true, useFindAndModify: false }
  );
}

async function validatePublisherBook(args) {
  const { title, ISBN, synopsis, genres, publicationYear } = args.book;
  const { publisher } = args.book;
  const { firstName, lastName, country } = args.book.authors[0];
  const { name, foundationYear } = publisher;
  var out;
  const publisherInfo = await Publisher.find({
    name: publisher.name,
  });
  if (
    (await Publisher.find({ name }).count()) < 1 &&
    (await Author.find({ firstName }).count()) < 1
  ) {
    var publisherAux = await createPublisher({
      name,
      foundationYear,
    });
    await publisherAux.save();

    var author = await createAuthor({
      firstName,
      lastName,
      country,
    });
    await author.save();

    //Creo el libro y anexo el publisher recien creado
    const bookWithNewPublisher = new Book({
      title,
      ISBN,
      synopsis,
      genres,
      publicationYear,
      publisher: publisherAux._id,
    });
    await bookWithNewPublisher.save();
    linkNewBookToPublisher(bookWithNewPublisher._id, publisherAux._id);
    linkNewBookToAuthor(bookWithNewPublisher._id, author._id);
    linkAuthorToBook(bookWithNewPublisher._id, author._id);
    out = bookWithNewPublisher;
  } else if ((await Author.find({ firstName }).count()) < 1) {
    const oldPublisher = await Publisher.find({ name });
    const oldAuthor = await Author.find({ firstName });
    const bookWithOldPublisher = new Book({
      title,
      ISBN,
      synopsis,
      genres,
      publicationYear,
      publisher: oldPublisher._id,
    });
    await bookWithOldPublisher.save();
    linkNewBookToPublisher(bookWithOldPublisher._id, oldPublisher[0]._id);
    linkNewBookToAuthor(bookWithOldPublisher._id, oldAuthor._id);
    linkAuthorToBook(bookWithOldPublisher._id, oldAuthor._id);
    out = bookWithOldPublisher;
  } else {
    //Creo sólo el libro
    const bookNoExist = new Book({
      title,
      ISBN,
      synopsis,
      genres,
      publicationYear,
      publisher: publisherInfo[0]._id,
    });
    bookNoExist.save();
    const author = await Author.find({ firstName });
    linkNewBookToPublisher(bookNoExist._id, publisherInfo[0]._id);
    linkNewBookToAuthor(bookNoExist._id, args.book.authors[0]._id);
    linkAuthorToBook(bookNoExist._id, author[0]._id);

    return bookNoExist;
  }
  return out;
}
module.exports = { resolvers };

