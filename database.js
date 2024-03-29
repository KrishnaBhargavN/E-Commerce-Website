const mysql = require("mysql2");

const database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bh@rath9",
  database: "ECommerce",
});

database.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }

  console.log("Connected to the MySQL database.");
});

module.exports = database;
