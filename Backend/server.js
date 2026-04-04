const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. แก้ไข Middleware CORS ให้รองรับ Hostinger
app.use(cors({
    origin: 'https://darkgreen-gorilla-736792.hostingersite.com', // URL ของหน้าเว็บคุณ
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// 2. เชื่อมต่อ MongoDB (ดึงค่าจาก Environment Variables ใน Render)
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('❌ Error: MONGO_URI is not defined in environment variables');
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected! ✅'))
  .catch(err => console.log('DB Error: ', err));

// 3. Routes (ตรวจสอบว่าโฟลเดอร์ routes อยู่ในที่เดียวกับไฟล์นี้)
app.use('/api/auth', require('./routes/auth'));

// 4. แก้ไข PORT ให้รองรับการรันบน Cloud
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    // บน Server จะไม่ใช้ localhost แล้ว
    console.log(`Server is running on port: ${PORT} 🚀`);
});