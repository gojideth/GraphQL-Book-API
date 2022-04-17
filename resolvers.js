const Author = require("./src/models/Author");
const Book = require("./src/models/Book");
const Publisher = require("./src/models/Publisher");

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
      publisher: await Author.find({_id:"625b2e074b3bdb0359ab4863"}),
      genres: ["Test1"],
      publicationYear: 2024,
    }
  );
}
//createBooks();

async function createPublishers(){
  var publisher = await createPublisher({
    name: "Panamericana",
    foundationYear:2012
  });
}

//createPublishers();

const output = async () => {
  var publisher = await Publisher.find({ name: "Panamericana" },{"_id":1});
  console.log(publisher);
 var books = await Book.find({publisher : publisher});
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
    getAllBooks: async(args)=>{      
      const books = await Book.find().limit(args.limitBooks);
      return books;
    },
    getAllPublishers: async(root,args)=>{
      console.log(root);
      const publishers = await Publisher.find();
      return publishers;
    },
    getAuthorId: async(_,args)=>{
      console.log(args.id);
      const author = await Author.findById(args.id);
      return author;
    },
    getBookId: async(_,args)=>{
      console.log(args.id)
      const book = await Book.findById(args.id);
      return book;
    },
    getPublisherId: async(_,args)=>{
      console.log(args.id);
      const publisher = await Publisher.findById(args.id);
      return publisher;
    }
  },
  Mutation:{
    createBook: async (_,args)=>{
      console.log("titulo->" + args.book.title)
      //console.log(args);
      const {title,ISBN, synopsis, publisher,genres,publicationYear} = args.Book;
      const newBook = new Book({title,ISBN, synopsis, publisher,genres,publicationYear});
      console.log(newBook);
      await newBook.save();
      return newBook;
    }
  }
};
module.exports = { resolvers };
