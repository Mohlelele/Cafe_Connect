CREATE DATABASE IF NOT EXISTS cafe_connect;
USE cafe_connect;

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS administrators (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  menu_item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  availability BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'Pending',
  order_number VARCHAR(50) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  menu_item_id INT,
  quantity INT NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  payment_method VARCHAR(50) NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

INSERT INTO menu_items (item_name, description, price, availability, image_url)
VALUES
  ('Chicken Burger', 'Grilled chicken burger with salad and sauce.', 220.00, TRUE, 'https://images.unsplash.com/...'),
  ('Cheese Pizza', 'Fresh cheese pizza with tomato sauce.', 260.00, TRUE, 'https://images.unsplash.com/...'),
  ('Rice and Curry', 'Traditional rice and curry meal.', 180.00, TRUE, 'https://images.unsplash.com/...'),
  ('Fruit Smoothie', 'Healthy fruit smoothie.', 150.00, TRUE, 'https://images.unsplash.com/...');
