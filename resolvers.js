const Author = require("./src/models/Author");
const Book = require("./src/models/Book");
const Publisher = require("./src/models/Publisher");

const createTutorial = (author) => {
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
  var tutorial = await createTutorial({
    firstName: "Martin ",
    lastName: "Chiquillo",
    country: "Colombia",
  });
  var tutorial1 = await createTutorial({
    firstName: "Camilo ",
    lastName: "Oliveros",
    country: "USA",
  });
  var tutoria2 = await createTutorial({
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
      publisher: await Author.findById("625b2e074b3bdb0359ab4863"),
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

  var publisher = await Publisher.findOne({ name: "Panamericana" });
  var books = await Book.find({ _id: { $in: publisher.booksPublished } });
  console.log(books);
};

output();

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
  },
};
module.exports = { resolvers };
