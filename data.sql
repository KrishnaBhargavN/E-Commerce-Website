-- Dummy data for LOGINS table
INSERT INTO LOGINS (EMAIL, PASSWORD) VALUES
('john@example.com', 'password123'),
('emma@example.com', 'qwerty456'),
('david@example.com', 'pass789');

-- Dummy data for CUSTOMERS table
INSERT INTO CUSTOMERS (FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS1, CITY, PROVINCE, POSTAL_CODE) VALUES
('John', 'Doe', 'john@example.com', '1234567890', '123 Main St', 'Cityville', 'Provinceville', 'A1B2C3'),
('Emma', 'Smith', 'emma@example.com', '9876543210', '456 Elm St', 'Townville', 'Provinceville', 'X1Y2Z3'),
('David', 'Johnson', 'david@example.com', '5554443333', '789 Oak St', 'Villageville', 'Provinceville', 'M1N2O3');

-- Dummy data for PRODUCTS table
INSERT INTO PRODUCTS (PRODUCT_NAME, PRODUCT_DESCRIPTION, PRICE, CATEGORY, STOCK) VALUES
('Laptop', 'High performance laptop', 999.99, 'Electronics', 50),
('Smartphone', 'Latest smartphone model', 599.99, 'Electronics', 100),
('Headphones', 'Noise-cancelling headphones', 149.99, 'Electronics', 75),
('T-shirt', 'Cotton T-shirt', 19.99, 'Clothing', 200),
('Jeans', 'Blue denim jeans', 39.99, 'Clothing', 150),
('Sneakers', 'Casual sneakers', 49.99, 'Shoes', 100);

-- Dummy data for ORDERS table
INSERT INTO ORDERS (CUSTOMER_ID, ORDER_DATE, ORDER_VALUE) VALUES
(1000, '2024-03-28', 999.99),
(1001, '2024-03-28', 619.98),
(1000, '2024-03-27', 169.98);

-- Dummy data for SIMILAR_PRODUCTS table
INSERT INTO SIMILAR_PRODUCTS (PRODUCT_ID_1, PRODUCT_ID_2) VALUES
(5000, 5001),
(5002, 5003),
(5004, 5005);

-- Dummy data for CARTS table
INSERT INTO CARTS (CUSTOMER_ID) VALUES
(1000),
(1001);

-- Dummy data for ORDER_ITEMS table
INSERT INTO ORDER_ITEMS (ORDER_ID, PRODUCT_ID, QUANTITY) VALUES
(10000, 5000, 1),
(10000, 5001, 1),
(10001, 5002, 1),
(10001, 5003, 2),
(10002, 5004, 1),
(10002, 5005, 1);

-- Dummy data for CART_ITEMS table
INSERT INTO CART_ITEMS (CART_ID, PRODUCT_ID, QUANTITY) VALUES
(20000, 5000, 1),
(20000, 5001, 1),
(20001, 5002, 1),
(20001, 5003, 1),
(20001, 5004, 1);
