const express = require("express");
const axios = require("axios");

const books = require("./booksdb.js");

const isValid =
  require("./auth_users.js").isValid;

const users =
  require("./auth_users.js").users;

const public_users = express.Router();


// ======================================================
// REGISTER USER
// ======================================================

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  if (!isValid(username)) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  users.push({
    username: username,
    password: password,
  });

  return res.status(200).json({
    message:
      "User successfully registered. Now you can login",
  });
});


// ======================================================
// GET ALL BOOKS
// ======================================================

public_users.get("/", (req, res) => {
  return res.status(200).json(books);
});


// ======================================================
// GET BOOK BY ISBN
// ======================================================

public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  return res.status(200).json(book);
});


// ======================================================
// GET BOOKS BY AUTHOR
// ======================================================

public_users.get("/author/:author", (req, res) => {
  const wantedAuthor =
    req.params.author.toLowerCase();

  const result = {};

  Object.keys(books).forEach((isbn) => {
    if (
      books[isbn].author.toLowerCase() ===
      wantedAuthor
    ) {
      result[isbn] = books[isbn];
    }
  });

  if (Object.keys(result).length === 0) {
    return res.status(404).json({
      message: "No books found for this author",
    });
  }

  return res.status(200).json(result);
});


// ======================================================
// GET BOOKS BY TITLE
// ======================================================

public_users.get("/title/:title", (req, res) => {
  const wantedTitle =
    req.params.title.toLowerCase();

  const result = {};

  Object.keys(books).forEach((isbn) => {
    if (
      books[isbn].title.toLowerCase() ===
      wantedTitle
    ) {
      result[isbn] = books[isbn];
    }
  });

  if (Object.keys(result).length === 0) {
    return res.status(404).json({
      message: "No books found for this title",
    });
  }

  return res.status(200).json(result);
});


// ======================================================
// GET BOOK REVIEW
// ======================================================

public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  return res.status(200).json(book.reviews);
});


// ======================================================
// ASYNC / AWAIT + AXIOS
// Required for grading
// ======================================================

const BASE_URL = "http://127.0.0.1:5000";


// ------------------------------------------------------
// Get all books using async/await and Axios
// ------------------------------------------------------

public_users.get(
  "/async/books",
  async (req, res) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/`,
        {
          proxy: false,
        }
      );

      return res
        .status(200)
        .json(response.data);
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving books",
      });
    }
  }
);


// ------------------------------------------------------
// Search by ISBN using Promise callback and Axios
// ------------------------------------------------------

public_users.get(
  "/async/isbn/:isbn",
  (req, res) => {
    const isbn = req.params.isbn;

    axios
      .get(
        `${BASE_URL}/isbn/${encodeURIComponent(
          isbn
        )}`,
        {
          proxy: false,
        }
      )
      .then((response) => {
        return res
          .status(200)
          .json(response.data);
      })
      .catch(() => {
        return res.status(404).json({
          message: "Book not found",
        });
      });
  }
);


// ------------------------------------------------------
// Search by author using async/await and Axios
// ------------------------------------------------------

public_users.get(
  "/async/author/:author",
  async (req, res) => {
    try {
      const author =
        encodeURIComponent(req.params.author);

      const response = await axios.get(
        `${BASE_URL}/author/${author}`,
        {
          proxy: false,
        }
      );

      return res
        .status(200)
        .json(response.data);
    } catch (error) {
      return res.status(404).json({
        message:
          "No books found for this author",
      });
    }
  }
);


// ------------------------------------------------------
// Search by title using async/await and Axios
// ------------------------------------------------------

public_users.get(
  "/async/title/:title",
  async (req, res) => {
    try {
      const title =
        encodeURIComponent(req.params.title);

      const response = await axios.get(
        `${BASE_URL}/title/${title}`,
        {
          proxy: false,
        }
      );

      return res
        .status(200)
        .json(response.data);
    } catch (error) {
      return res.status(404).json({
        message:
          "No books found for this title",
      });
    }
  }
);


module.exports.general = public_users;