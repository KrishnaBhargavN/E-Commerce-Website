const express = require("express");
const router = express.Router();
const connection = require("../database");

router.post("/signUp", (req, res) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const contactNumber = req.body.contactNumber;
  const address1 = req.body.address1;
  const city = req.body.city;
  const province = req.body.province;
  const postal_code = req.body.postal_code;
  const password = req.body.password;

  const checkQuery = `SELECT * FROM logins WHERE email = "${email}";`;

  connection.query(checkQuery, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ statusMessage: "Internal Server Error" });
    } else if (results.length > 0) {
      res.status(409).json({ statusMessage: "Email already exists" });
    } else {
      const insertQuery = `INSERT INTO logins (email, password) VALUES ("${email}", "${password}");`;
      connection.query(insertQuery, (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
          res.status(500).json({ statusMessage: "Internal Server Error" });
        } else {
          const insertLoginQuery = `INSERT INTO customers (first_name, last_name, email, phone, address1, city, province, postal_code) VALUES ("${fname}", "${lname}", "${email}", "${contactNumber}", "${address1}", "${city}", "${province}", "${postal_code}");`;
          connection.query(insertLoginQuery, (err, results) => {
            if (err) {
              console.error("Error inserting data:", err);
              res.status(500).json({ statusMessage: "Internal Server Error" });
            } else {
              res.status(200).json({ statusMessage: "Signup successful" });
            }
          });
        }
      });
    }
  });
});

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
      // Set cookies inside the callback
      res.cookie("email", email, { maxAge: 3600000, httpOnly: true });

      connection.query(
        `select * from carts inner join customers on customers.customer_id=carts.customer_id where customers.email = "${email}"`,
        (err, results) => {
          if (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ statusMessage: "Internal Server Error" });
          } else if (results.length === 0) {
            connection.query(
              `insert into carts (customer_id) values ((select customer_id from customers where email = '${email}' limit 1));`,
              (err, results) => {
                if (err) {
                  console.error("Error inserting data:", err);
                  res
                    .status(500)
                    .json({ statusMessage: "Internal Server Error" });
                } else {
                  // Send response here
                  res.status(200).json({ statusMessage: "Login successful" });
                }
              }
            );
          } else {
            console.log("Cart already exists");
            connection.query(
              `select max(cart_id) as cart_id from carts inner join customers on customers.customer_id=carts.customer_id where customers.email = '${email}'`,
              (err, results) => {
                if (err) {
                  console.error("Error fetching data:", err);
                  res
                    .status(500)
                    .json({ statusMessage: "Internal Server Error" });
                } else {
                  console.log("Cart ID:", results[0].cart_id);
                  res.cookie("cart_id", results[0].cart_id, {
                    maxAge: 3600000,
                    httpOnly: true,
                  });
                  // Send response here
                  res.status(200).json({ statusMessage: "Login successful" });
                }
              }
            );
          }
        }
      );
    }
  });
});

router.get("/logout", (req, res) => {
  // clear cookies
  res.clearCookie("email");
  res.clearCookie("cart_id");
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
