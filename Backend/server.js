const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── 1. CORS & Middleware ───
const allowedOrigins = [
    'https://darkgreen-gorilla-736792.hostingersite.com',
    'https://terminal21-planner.com',                     
    'http://localhost:5173',                             
    'http://localhost:3000'                              
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

// ─── 3. สร้าง Schema & Model สำหรับ Dashboard ───
// (แนะนำให้แยกไฟล์ไปที่โฟลเดอร์ models/Dashboard.js ในอนาคตเพื่อความเป็นระเบียบ)
const DashboardSchema = new mongoose.Schema({
  kpis: {
    totalPosts: { type: Number, default: 0 },
    totalAds: { type: Number, default: 0 },
  },
  campaigns: [{
    name: String,
    score: Number, // ตัวเลขที่ใช้จัดอันดับ
    reach: Number
  }]
});

const Dashboard = mongoose.model('Dashboard', DashboardSchema);

// ─── 4. Routes หลักของคุณ ───
// ตรวจสอบโฟลเดอร์ routes และไฟล์ auth.js ให้ถูกต้อง
app.use('/api/auth', require('./routes/auth'));

// หากคุณมี Route ของ Works อย่าลืมเพิ่มด้วย
// app.use('/api/works', require('./routes/works'));


// ─── 5. Routes สำหรับ Dashboard (ดึงข้อมูล & อัปเดตข้อมูล) ───

// [GET] ดึงข้อมูลไปโชว์ที่ Dashboard และหน้า Editor
app.get('/api/dashboard', async (req, res) => {
  try {
    let data = await Dashboard.findOne();
    // ถ้ายังไม่มีข้อมูลใน DB ให้สร้าง Default ขึ้นมา
    if (!data) {
      data = await Dashboard.create({ kpis: { totalPosts: 0, totalAds: 0 }, campaigns: [] });
    }
    // จัดเรียงแคมเปญตามคะแนน (score) จากมากไปน้อย ก่อนส่งกลับ
    data.campaigns.sort((a, b) => b.score - a.score);
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// [POST] Editor บันทึกข้อมูล (อัปเดตข้อมูลเดิม หรือสร้างใหม่ถ้ายังไม่มี)
app.post('/api/dashboard', async (req, res) => {
  try {
    const { kpis, campaigns } = req.body;
    
    // จัดเรียงลำดับจากฝั่ง Backend เพื่อความชัวร์
    const sortedCampaigns = campaigns.sort((a, b) => b.score - a.score);
    
    let data = await Dashboard.findOne();
    if (data) {
      data.kpis = kpis;
      data.campaigns = sortedCampaigns;
      await data.save();
    } else {
      data = await Dashboard.create({ kpis, campaigns: sortedCampaigns });
    }
    res.json({ message: 'บันทึกข้อมูลแดชบอร์ดเรียบร้อย! ✅', data });
  } catch (error) {
    console.error('Error saving dashboard:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── 6. เริ่มต้น Server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT} 🚀`);
});