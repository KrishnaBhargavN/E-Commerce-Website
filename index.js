const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const session = require("express-session");
const PORT = 3000;

// Session middleware
app.use(
  session({
    secret: "changeitinprod!",
    saveUninitialized: true,
    cookie: { secure: false }, // Change to true if using HTTPS
  })
);
app.use(express.json());
app.use(bodyParser.json());

const authorization = require("./routes/authorization");
const register = require("./routes/register");
const profile = require("./routes/profile");
const fetch = require("./routes/fetch");
const swapRequest = require("./routes/swapRequest");
const products = require("./routes/products");

app.use("/routes/authorization/", authorization);
app.use("/routes/swapRequest/", swapRequest);
app.use("/routes/register/", register);
app.use("/routes/profile/", profile);
app.use("/routes/fetch/", fetch);
app.use("/routes/products/", products);

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "frontend/screens/SignUpPage.html");
  fs.readFile(indexPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading index.html:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.send(data);
  });
});

app.use(express.static("frontend"));
app.listen(PORT, () =>
  console.log(`Serve running on port: http://localhost:${PORT}`)
);
