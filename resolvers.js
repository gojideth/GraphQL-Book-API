const { getArgumentValues } = require("@graphql-tools/utils");
const mongoose = require("mongoose");
const Author = require("./src/models/Author");
const Book = require("./src/models/Book");
const Publisher = require("./src/models/Publisher");
const typeDb = require("mongoose").Types;

const createAuthor = (author) => {
  return Author.create(author).then((author) => {
    console.log(`Tutorial created ${author}`);
    return author;
  });
};

const createPublisher = (publisher) => {
  return Publisher.create(publisher).then((publisher) => {
    console.log(`Tutorial created ${publisher}`);
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

const test = async () => {
  var tutorial = await createAuthor({
    firstName: "Martin ",
    lastName: "Chiquillo",
    country: "Colombia",
  });
  var tutorial1 = await createAuthor({
    firstName: "Camilo ",
    lastName: "Oliveros",
    country: "USA",
  });
  var tutoria2 = await createAuthor({
    firstName: "Natalia  ",
    lastName: "Castro",
    country: "España",
  });
};
//test();
async function createBooks() {
  var bookTest = await createBook(
    await Author.findById("625b2e074b3bdb0359ab4863"),
    {
      title: "F pluton",
      ISBN: "sdsds222SSHJDFSJ2",
      synopsis: "Está siendo un éxito en todo lao",
      publisher: await Author.find({ _id: "625b2e074b3bdb0359ab4863" }),
      genres: ["Test1"],
      publicationYear: 2024,
    }
  );
}
//createBooks();

async function createPublishers() {
  var publisher = await createPublisher({
    name: "Panamericana",
    foundationYear: 2012,
  });
}

//createPublishers();

const output = async () => {
  var publisher = await Publisher.find({ name: "Panamericana" }, { _id: 1 });
  console.log(publisher);
  var books = await Book.find({ publisher: publisher });
  console.log(books);
};

//output();

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
    getFromIdToObject: async(root,args)=>{
      console.log(root.Publisher);
      return root;
    }
  },
  Mutation: {
    createBook: async (root, args) => {
      const newBook = await validatePublisherBook(args);
      console.log("New book-->" + newBook.publisher);
      return newBook;
    },
    updateBook: async (_,{id,book})=>{
      const bookUpdated = await Book.findByIdAndUpdate(id, {
        $set:book
      }, {new:true})
      return bookUpdated;
    },
    deleteBook: async(_,{id}) =>{
      await Book.findByIdAndRemove(id);
      return `Book with ID ${id} deleted`;

    }
    
  },
};
module.exports = { resolvers };
async function validatePublisherBook(args) { 
  const { title, ISBN, synopsis, genres, publicationYear } = args.book;
  const { publisher } = args.book;

  const publisherInfo = await Publisher.find({
    name: args.book.publisher.name,
  });
  if ((await Publisher.find({ name: args.book.publisher.name }).count()) < 1) {
    console.log("No existe el publicador ");
    var publisherAux = await createPublisher({
      name: args.book.publisher.name,
      foundationYear: args.book.publisher.foundationYear,
    });
    await publisherAux.save();

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
    out =  bookWithNewPublisher;
  } else {
    const {name, foundationYear } = publisherInfo[0];
    const oldPublisher = await Publisher.find({name });
    //Ahora sí ya existe el publisher debo traerlo completo
    //Creo el libro con el publisher existente
    const bookWithOldPublisher = new Book({
      title,
      ISBN,
      synopsis,
      genres,
      publicationYear,
      publisher: oldPublisher[0]._id,
    });
    await bookWithOldPublisher.save();
    linkNewBookToPublisher(bookWithOldPublisher._id,oldPublisher[0]._id );
    console.log("Libro con publisher viejo guardado");
    out = bookWithOldPublisher;
  }
  console.log("Out -->" + out);
  return out;
}

async function linkNewBookToPublisher(bookId, publisherId) {
  return await Publisher.findByIdAndUpdate(
    publisherId,
    { $push: { booksPublished: bookId._id } },
    { new: true, useFindAndModify: false }
  );
}
