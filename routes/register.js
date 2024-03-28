const express = require("express");
const router = express.Router();
const connection = require("../database");
const bcrypt = require("bcryptjs");

router.post("/signUp", (req, res) => {
  console.log(req.body);
  const firstName = req.body.firstName;
  const lastname = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;
  const address1 = req.body.address1;
  const city = req.body.city;
  const pincode = req.body.pincode;
  const province = req.body.province;

  const emailQuery = `SELECT * FROM customers WHERE email = "${email}"`;

  connection.query(emailQuery, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).send("Error fetching data");
    }

    if (results.length !== 0) {
      return res.status(401).json({ status: "Account already exists" });
    }

    connection.beginTransaction((err) => {
      const insertQueryLogin = `INSERT INTO logins (email, passcode) VALUES (?, ?)`;
      const insertParamsLogin = [email, password];

      connection.query(insertQueryLogin, insertParamsLogin, (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).send("Error inserting data");
        }

        const insertQueryCustomer = `INSERT INTO customers (FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS1, CITY, PROVINCE, POSTAL_CODE) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertParamsCustomer = [
          firstName,
          lastname,
          email,
          phone,
          address1,
          city,
          province,
          pincode,
        ];

        connection.query(
          insertQueryCustomer,
          insertParamsCustomer,
          (err, results) => {
            if (err) {
              console.error("Error inserting data in Room Table:", err);
              return res.status(500).send("Error inserting data");
            }
          }
        ); // Proceed with inserting data if email is not already registered
      });
    });
  });

  console.log("Everything worked");
});

router.post("/addPersonToAvailableRooms", (req, res) => {
  const { addToAvailableRooms } = req.body;
  const email = req.session.user["email"];
  console.log(email);
  connection.query(
    "SELECT * FROM STUDENT WHERE EMAIL = ?",
    [email],
    (error, studentRow) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (studentRow.length === 0) {
        return res.status(404).json({ error: "Student not found." });
      }

      if (addToAvailableRooms !== true) {
        return res
          .status(400)
          .json({ error: "Invalid addToAvailableRooms value." });
      }

      const { ROOM_ID, STUDENT_ID } = studentRow[0];
      connection.query(
        "INSERT INTO AVAILABLE_ROOM (ROOM_ID, STUDENT_ID, ROOM_STATUS, Description) VALUES (?, ?, ?, ?)",
        [ROOM_ID, STUDENT_ID, "Y", null],
        (insertError, result) => {
          if (insertError) {
            console.error("Error executing INSERT query:", insertError);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          res.status(201).json({
            message: "Your request for room swap has been accepted !!",
            result,
          });
        }
      );
    }
  );
});

router.get("/checkStudentInAvailableRooms", (req, res) => {
  const email = req.session.user["email"];
  console.log(email);

  connection.query(
    "SELECT * FROM AVAILABLE_ROOM WHERE STUDENT_ID = (SELECT STUDENT_ID FROM STUDENT WHERE EMAIL = ?)",
    [email],
    (error, result) => {
      if (error) {
        console.error("Error executing SELECT query:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.length > 0) {
        res.status(200).json({ message: "yes", result });
      } else {
        res.status(404).json({ message: "not found" });
      }
    }
  );
});

module.exports = router;
