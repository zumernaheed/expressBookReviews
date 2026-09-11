const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");

const regd_users = express.Router();

const users = [];

// Check whether username is available
const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    (user) =>
      user.username === username &&
      user.password === password
  );
};

// Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const accessToken = jwt.sign(
    { username: username },
    "access",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken: accessToken,
    username: username,
  };

  return res.status(200).json({
    message: "User successfully logged in",
  });
});

// Add or update review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Accept review from query parameter OR JSON body
  const review = req.query.review || req.body.review;

  const username =
    req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  if (!review) {
    return res.status(400).json({
      message: "Review text is required",
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/updated",
    reviews: books[isbn].reviews,
  });
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const username =
    req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      books[isbn].reviews,
      username
    )
  ) {
    return res.status(404).json({
      message:
        "No review by this user found for this book",
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review successfully deleted",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;