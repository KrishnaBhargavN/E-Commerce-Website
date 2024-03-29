const express = require("express");
const emailNotification = require("../emailNotification");
const router = express.Router();
const connection = require("../database");
const subject = "Your Room Swap Request has been accepted";
roomResult = [];

router.get("/getProducts/:offset", (req, res) => {
  const user = req.session.user;
  const offset = req.params.offset;
  connection.query(
    `SELECT * FROM PRODUCTS limit 25 offset ${offset * 25}`,
    (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Error fetching products");
        return;
      }

      res.status(200).json(results);
    }
  );
});

router.get("/getOrdersProducts", (req, res) => {
  const customer_id = req.headers.customer_id;
  console.log("req is", req.headers);
  console.log("Customer_id", customer_id);
  connection.query(
    `SELECT o.ORDER_ID, o.ORDER_DATE, o.ORDER_VALUE FROM ORDERS as o, ORDER_ITEMS as oi WHERE o.ORDER_ID=oi.ORDER_ID AND o.CUSTOMER_ID=${customer_id};`,
    (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Error fetching products");
        return;
      }

      res.status(200).json(results);
    }
  );
});

router.get("/categories/:category/:offset", (req, res) => {
  const category = req.params.category;
  const offset = req.params.offset;
  connection.query(
    `SELECT * FROM PRODUCTS WHERE category = '${category}' limit 10 offset ${
      offset * 10
    }`,
    (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Error fetching products");
        return;
      }

      res.status(200).json(results);
    }
  );
});

router.get("/product/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * FROM PRODUCTS WHERE product_id = ${id}`,
    (err, results) => {
      if (err) {
        console.error("Error fetching product:", err);
        res.status(500).send("Error fetching product");
        return;
      }

      res.status(200).json(results);
    }
  );
});

router.get("/profile/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * FROM customers WHERE customer_id = ${id}`,
    (err, results) => {
      if (err) {
        console.error("Error fetching user:", err);
        res.status(500).send("Error fetching user");
        return;
      }

      res.status(200).json(results);
    }
  );
});

router.get("/getCartProducts/:id", (req, res) => {
  const user = req.session.user;
  const id = req.params.id;
  connection.query(
    `SELECT * FROM CARTS WHERE customer_id = ${id}`,
    (err, results) => {
      if (err) {
        console.error("Error fetching cart products:", err);
        res.status(500).send("Error fetching cart products");
        return;
      }

      res.status(200).json(results);
    }
  );
});

module.exports = router;
