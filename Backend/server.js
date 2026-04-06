const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── 1. แก้ไข Middleware CORS ให้รองรับหลายโดเมน ───
const allowedOrigins = [
    'https://darkgreen-gorilla-736792.hostingersite.com', // โดเมนเก่า
    'https://terminal21-planner.com',                     // โดเมนใหม่ (ที่คุณใช้ปัจจุบัน)
    'http://localhost:5173',                             // สำหรับทดสอบบนเครื่อง (Vite)
    'http://localhost:3000'                              // สำหรับทดสอบบนเครื่อง (React)
];

app.use(cors({
    origin: function (origin, callback) {
        // อนุญาตถ้า origin อยู่ในรายการ หรือเป็น request ที่ไม่มี origin (เช่น Postman/Mobile)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS: Origin not allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ─── 2. เชื่อมต่อ MongoDB ───
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('❌ Error: MONGO_URI is not defined in environment variables');
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected! ✅'))
  .catch(err => console.log('DB Error: ', err));

// ─── 3. Routes ───
// ตรวจสอบโฟลเดอร์ routes และไฟล์ auth.js ให้ถูกต้อง
app.use('/api/auth', require('./routes/auth'));

// หากคุณมี Route ของ Works อย่าลืมเพิ่มด้วย
// app.use('/api/works', require('./routes/works'));

// ─── 4. PORT สำหรับ Render ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT} 🚀`);
});