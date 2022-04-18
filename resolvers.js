const { getArgumentValues } = require("@graphql-tools/utils");
const mongoose = require("mongoose");
const Author = require("./src/models/Author");
const Book = require("./src/models/Book");
const Publisher = require("./src/models/Publisher");
const User = require("./src/models/User");
const typeDb = require("mongoose").Types;

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
    createUser: async (root, args) => {
      const { email, password } = args;
      console.log(email);
      var out;
      if ((await User.find({ email }).count) >= 1) {
        out = `Sorry user with that email already created`;
      } else {
        const user = new User({
          email,
          password,
        });
        await user.save();
      }
      out = `User with email ${email} created succesfully, please login now`;
      return out;
    },
  },
};

/**
 * Use email as login, use password as password
 * @param {string} email
 * @param {string} password
 */
/**const createToken = (email, password) => {
  if (!email || !password) {
    // no credentials = fail
    return false;
  }

  const user = User.find({email},{});

  if (!user) {
    // return false if not found
    return false;
  }
  const payload = {
    username: user.email,
  };
  const token = jwt.sign(payload, secret, {
    expiresIn,
  });
  return token;
  console.log(token);
};*/

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
      publisher: publisherInfo[0]._id
    });
    bookNoExist.save();
    const author = await Author.find({firstName});
    linkNewBookToPublisher(bookNoExist._id, publisherInfo[0]._id);
    linkNewBookToAuthor(bookNoExist._id, args.book.authors[0]._id);
    linkAuthorToBook(bookNoExist._id,author[0]._id);    

    return bookNoExist;
  }
  return out;
}
module.exports = { resolvers };
