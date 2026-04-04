const mongoose = require('mongoose');

// --- 1. นิยามโครงสร้างข้อมูล (Schema) ---
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'กรุณาระบุชื่อผู้ใช้'], 
    unique: true, // ป้องกันการสมัครซ้ำ
    trim: true    // ตัดช่องว่างหัว-ท้ายอัตโนมัติ
  },
  password: { 
    type: String, 
    required: [true, 'กรุณาระบุรหัสผ่าน'] 
  },
  role: {
    type: String,
    default: 'planner' // กำหนดสิทธิ์พื้นฐานเป็น planner
  },
  createdAt: {
    type: Date,
    default: Date.now // บันทึกเวลาที่สร้างบัญชี
  }
});

// --- 2. สร้าง Model จาก Schema แล้ว Export ออกไปใช้ ---
module.exports = mongoose.model('User', UserSchema);