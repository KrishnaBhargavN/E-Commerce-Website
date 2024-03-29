const express = require("express");
const emailNotification = require("../emailNotification");
const router = express.Router();
const connection = require("../database");
const subject = "Your Room Swap Request has been accepted";
roomResult = [];

router.get("/getCustomerId", (req, res) => {
  const email = req.cookies.email;

  console.log("cookie", req.cookies);
  console.log("email is", email);
  connection.query(
    `SELECT customer_id FROM customers WHERE email = '${email}'`,
    (err, results) => {
      if (err) {
        console.error("Error fetching customer id:", err);
        res.status(500).send("Error fetching customer id");
        return;
      }

      res.status(200).json(results);
    }
  );
});

router.get("/getProducts", (req, res) => {
  // const offset = req.params.offset;
  const offset = 0;
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

router.post("/placeOrder", (req, res) => {
  const customer_id = req.body.customer_id;
  const cart_id = req.body.cart_id;
  const order_date = new Date().toISOString().slice(0, 19).replace("T", " ");

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error beginning transaction:", err);
      return res.status(500).send("Error placing order");
    }

    connection.query(
      `select sum(products.price*cart_items.quantity) as total_price 
      from cart_items 
      inner join carts on cart_items.cart_id=carts.cart_id 
      inner join products on cart_items.product_id=products.product_id 
      where carts.customer_id=${customer_id} and carts.cart_id=${cart_id} 
        and cart_items.quantity<=products.stock;`,
      (err, results) => {
        if (err) {
          return connection.rollback(() => {
            console.error("Error fetching cart items:", err);
            res.status(500).send("Error placing order");
          });
        }
        console.log("results => ", results);
        if (results.length === 0) {
          return connection.rollback(() => {
            console.error("Error fetching cart items:", err);
            res.status(500).send("Error placing order");
          });
        }
        const total_price = results[0].total_price;
        connection.query(
          `INSERT INTO ORDERS (CUSTOMER_ID, ORDER_DATE, ORDER_VALUE) VALUES (${customer_id}, '${order_date}', ${results[0].total_price})`,
          (err, results) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error inserting into ORDERS:", err);
                res.status(500).send("Error placing order");
              });
            }
            console.log("results => ", results);
            connection.query(
              `SELECT max(order_id) as order_id FROM ORDERS WHERE CUSTOMER_ID = ${customer_id} AND ORDER_DATE = '${order_date
                .split(" ")[0]
                .trimEnd()}'`,
              (err, results) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error("Error fetching order:", err);
                    res.status(500).send("Error placing order");
                  });
                }
                console.log("results => ", results);
                const order_id = results[0].order_id;
                connection.query(
                  `select * from cart_items, carts where cart_items.cart_id=carts.cart_id and carts.customer_id=${customer_id} and carts.cart_id=${cart_id};`,
                  (err, results) => {
                    if (err) {
                      return connection.rollback(() => {
                        console.error("Error fetching cart items:", err);
                        res.status(500).send("Error placing order");
                      });
                    }

                    results.forEach((item) => {
                      connection.query(
                        `INSERT INTO ORDER_ITEMS (ORDER_ID, PRODUCT_ID, QUANTITY) VALUES (${order_id}, ${item.product_id}, ${item.quantity})`,
                        (err, results) => {
                          if (err) {
                            return connection.rollback(() => {
                              console.error(
                                "Error inserting into ORDER_ITEMS:",
                                err
                              );
                              res.status(500).send("Error placing order");
                            });
                          }
                        }
                      );
                    });
                  }
                );
              }
            );
          }
        );
        connection.query(
          `update products inner join cart_items on products.product_id=cart_items.product_id set products.stock=products.stock-cart_items.quantity where cart_items.cart_id=${cart_id};`,
          (err, results) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error deleting from CARTS:", err);
                res.status(500).send("Error placing order");
              });
            }
          }
        );

        connection.query(
          `DELETE FROM CART_ITEMS WHERE CART_ID = ${cart_id}`,
          (err, results) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error deleting from CART_ITEMS:", err);
                res.status(500).send("Error placing order");
              });
            }
          }
        );

        connection.query(
          `DELETE FROM CARTS WHERE CART_ID = ${cart_id}`,
          (err, results) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error deleting from CARTS:", err);
                res.status(500).send("Error placing order");
              });
            }
          }
        );

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).send("Error placing order");
            });
          }
          res.status(200).json({ message: "Order placed" });
        });
      }
    );
  });
});

router.post("/createNewCart", (req, res) => {
  const customer_id = req.body.customer_id;
  connection.query(
    `INSERT INTO CARTS (customer_id) VALUES (${customer_id})`,
    (err, results) => {
      if (err) {
        console.error("Error creating new cart:", err);
        res.status(500).send("Error creating new cart");
        return;
      }

      res.status(200).json({ message: "New cart created" });
    }
  );
});

router.post("/addToCart", (req, res) => {
  console.log("req.body => ", req.body);
  const product = req.body.product;
  const quantity = req.body.quantity;
  const customer_id = req.body.customer_id;
  const cart_id = req.body.cart_id;
  console.log("product => ", product);
  console.log("quantity => ", quantity);
  console.log("customer_id => ", customer_id);
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error beginning transaction:", err);
      return res.status(500).send("Error adding to cart");
    }

    connection.query(
      `INSERT INTO CART_ITEMS (CART_ID, PRODUCT_ID, QUANTITY) VALUES (${cart_id}, ${product}, ${quantity})`,
      (err, results) => {
        if (err) {
          return connection.rollback(() => {
            console.error("Error inserting into CART_ITEMS:", err);
            res.status(500).send("Error adding to cart");
          });
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing transaction:", err);
              res.status(500).send("Error adding to cart");
            });
          }
          res.status(200).json({ message: "Added to cart" });
        });
      }
    );
  });
});

router.post("/deleteProductFromCart", (req, res) => {
  const product_id = req.body.product_id;
  const cart_id = req.body.cart_id;
  connection.query(
    `DELETE FROM CART_ITEMS WHERE PRODUCT_ID = ${product_id} AND CART_ID = ${cart_id}`,
    (err, results) => {
      if (err) {
        console.error("Error deleting product from cart:", err);
        res.status(500).send("Error deleting product from cart");
        return;
      }

      res.status(200).json({ message: "Product deleted from cart" });
    }
  );
});

module.exports = router;
