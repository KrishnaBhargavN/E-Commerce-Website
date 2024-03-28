const express = require("express");
const router = express.Router();
const connection = require("../database");

router.get("/profileDetails", (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    // If user is logged in, retrieve user information from session
    const user = req.session.user;
    const emailId = user["email"];
    const query = `select * from customers where email = '?'`;
    connection.query(query, [emailId], (err, results) => {
      if (err) {
        console.error("Error fetching student data:", err);
        res.status(500).send("Error fetching student data");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Student not found");
        return;
      }
      res.status(200).json(results[0]);
    });
  } else {
    res.redirect("../frontend/screens/SignUpPage.html");
  }
});

router.get("/roomDetails", (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    // If user is logged in, retrieve user information from session
    const user = req.session.user;
    const emailId = user["email"];
    const query = `SELECT ROOM.ROOM_ID, ROOM.BUILDING_NAME, ROOM.FLOOR_NO, ROOM.WING, ROOM.ROOM_NUMBER 
            FROM STUDENT INNER JOIN ROOM ON STUDENT.ROOM_ID = ROOM.ROOM_ID WHERE STUDENT.EMAIL = ?`;
    connection.query(query, [emailId], (err, results) => {
      if (err) {
        console.error("Error fetching room data:", err);
        res.status(500).send("Error fetching room data");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Room not found");
        return;
      }
      res.status(200).json(results[0]);
    });
  } else {
    res.redirect("../frontend/screens/SignUpPage.html");
  }
});

router.get("/name", (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    // If user is logged in, retrieve user information from session
    const user = req.session.user;
    const emailId = user["email"];
    const query = `select name from STUDENT where email = '${emailId}' ;`;
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Error fetching data");
        return;
      }
      res.status(200).json(results[0]);
    });
  }
});

module.exports = router;
