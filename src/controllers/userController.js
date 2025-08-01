const db = require('../../config/db');
const { hashPassword, verifyPassword } = require('../utils/hash');

// Register user
exports.register = async (req, res) => {
  const { user_id, user_pw, user_name, age, height, weight, sex, preg, dis } = req.body;

  try {
    const hashed = await hashPassword(user_pw);

    // Insert into user table
    await db.query(
      'INSERT INTO user (user_id, user_pw, user_name) VALUES (?, ?, ?)',
      [user_id, hashed, user_name]
    );

    // Insert into user_Info table
    await db.query(
      'INSERT INTO user_Info (user_id, age, height, weight, sex, preg, dis) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, age, height, weight, sex, preg, dis]
    );

    res.status(201).send('User registered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
};

// Login user
exports.login = async (req, res) => {
  const { user_id, user_pw } = req.body;

  try {
    const [rows] = await db.query('SELECT user_pw FROM user WHERE user_id = ?', [user_id]);

    if (rows.length === 0) return res.status(401).send('Invalid credentials');

    const match = await verifyPassword(user_pw, rows[0].user_pw);

    if (!match) return res.status(401).send('Invalid credentials');

    res.send('Login successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
};
