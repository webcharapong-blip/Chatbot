const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ─── 1. สร้าง Schema สำหรับ User ───
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' } // กำหนดสิทธิ์
});

// ตรวจสอบว่ามี Model สร้างไว้หรือยัง ป้องกัน error ตอนเรียกซ้ำ
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ─── 2. API สำหรับ "สร้างบัญชี" (Register & เข้ารหัสผ่าน) ───
// ใช้ API นี้ผ่าน Postman ครั้งแรกเพื่อสร้างบัญชี editor และ viewer
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // เช็คว่ามี User นี้ในระบบหรือยัง
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });
    }

    // 🔒 ทำการ "เข้ารหัสผ่าน" (Hash Password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง User ใหม่พร้อมรหัสผ่านที่เข้ารหัสแล้ว
    user = new User({
      username,
      password: hashedPassword,
      role: role || 'viewer' // ถ้าไม่ส่ง role มา ให้ค่าเริ่มต้นเป็น viewer
    });

    await user.save();
    res.status(201).json({ message: `สร้างบัญชี ${username} สำเร็จ!`, role: user.role });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── 3. API สำหรับ "เข้าสู่ระบบ" (Login) ───
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ค้นหา User ในฐานข้อมูล
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง' });
    }

    // 🔓 "เปรียบเทียบรหัสผ่าน" ที่พิมพ์มา กับที่เข้ารหัสไว้ใน Database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง Payload สำหรับทำ Token
    const payload = {
      user: {
        id: user.id,
        role: user.role // ใส่ role เข้าไปใน Token ด้วย
      }
    };

    // สร้าง JWT Token (ต้องมีค่า JWT_SECRET ในไฟล์ .env ของคุณ)
    const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_12345';
    jwt.sign(
      payload,
      secretKey,
      { expiresIn: '1d' }, // Token มีอายุ 1 วัน
      (err, token) => {
        if (err) throw err;
        // ✅ ส่ง Token และ Role กลับไปให้ Frontend (App.jsx และ Login.jsx ของคุณ)
        res.json({ token, role: user.role });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;