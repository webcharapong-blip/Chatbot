const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // มั่นใจว่ามีไฟล์ models/User.js แล้วนะครับ

// --- 1. สำหรับสมัครสมาชิก (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ตรวจสอบว่ามี User นี้หรือยัง
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "มีชื่อผู้ใช้นี้แล้ว" });

    // เข้ารหัสพาสเวิร์ด
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    
    await newUser.save();
    res.status(201).json({ message: "User Created! ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. สำหรับล็อกอิน (POST /api/auth/login) ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } else {
      res.status(400).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง! ❌" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;