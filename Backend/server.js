const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

// ─── Cloudinary Config ───
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── CORS & Middleware ───
app.use(cors({
  origin: ['https://darkgreen-gorilla-736792.hostingersite.com', 'https://terminal21-planner.com', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── เชื่อมต่อ MongoDB ───
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected! ✅'));

// ─── Schemas ───
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'editor', 'planner'], default: 'viewer' }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ItemSchema = new mongoose.Schema({ name: String, score: Number, image: String });
const AdsSchema = new mongoose.Schema({ name: String, cost: Number, metricValue: Number, metricType: String, image: String });

const DashboardSchema = new mongoose.Schema({
  month: { type: String, required: true },
  kpis: { totalResult: { type: Number, default: 0 }, totalAdvertising: { type: Number, default: 0 } },
  topOrganic: [ItemSchema],
  topLike: [ItemSchema],
  topAds: [AdsSchema]
});
const Dashboard = mongoose.models.Dashboard || mongoose.model('Dashboard', DashboardSchema);

// ─── ฟังก์ชันช่วยอัปโหลดไป Cloudinary ───
const uploadToCloudinary = async (base64Img) => {
  if (!base64Img || base64Img.startsWith('http')) return base64Img;
  try {
    const response = await cloudinary.uploader.upload(base64Img, { folder: 'dashboard_posts' });
    return response.secure_url;
  } catch (err) {
    console.error('Cloudinary Error:', err);
    return null;
  }
};

// ─── Auth Routes ───
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (await User.findOne({ username })) return res.status(400).json({ message: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: role || 'viewer' });
    await user.save();
    res.status(201).json({ message: `สร้างบัญชีสำเร็จ!`, role: user.role });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง' });
    jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// ─── Dashboard Routes ───
app.get('/api/dashboard', async (req, res) => {
  try {
    const data = await Dashboard.findOne({ month: req.query.month });
    res.json(data || { month: req.query.month, kpis: {}, topOrganic: [], topLike: [], topAds: [] });
  } catch (error) { res.status(500).json({ error: 'Server Error' }); }
});

app.post('/api/dashboard', async (req, res) => {
  try {
    const { month, kpis, topOrganic, topLike, topAds } = req.body;
    const uploadImages = async (list) => Promise.all(list.map(async (item) => ({ ...item, image: await uploadToCloudinary(item.image) })));

    const finalOrganic = await uploadImages(topOrganic || []);
    const finalLike = await uploadImages(topLike || []);
    const finalAds = await uploadImages(topAds || []);

    let data = await Dashboard.findOneAndUpdate(
      { month }, { kpis, topOrganic: finalOrganic, topLike: finalLike, topAds: finalAds }, { new: true, upsert: true }
    );
    res.json({ message: 'บันทึกข้อมูลและอัปโหลดรูปสำเร็จ!', data });
  } catch (error) { res.status(500).json({ error: 'Server Error' }); }
});

app.listen(process.env.PORT || 5000, () => console.log(`Server running 🚀`));