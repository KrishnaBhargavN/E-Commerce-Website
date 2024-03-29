const express = require("express");
const router = express.Router();
const connection = require("../database");

router.post("/login", (req, res) => {
  const email = req.body.email;
  const givenPassword = req.body.passcode;

  const checkQuery = `SELECT password FROM logins WHERE email = "${email}";`;

  connection.query(checkQuery, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ statusMessage: "Internal Server Error" });
    } else if (results.length === 0) {
      res.status(401).json({ statusMessage: "Email is invalid" });
    } else if (givenPassword != results[0].password) {
      res.status(401).json({ statusMessage: "Incorrect password" });
    } else {
      req.session.user = req.body;
      res.status(200).json({ statusMessage: "Login successful" });
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
