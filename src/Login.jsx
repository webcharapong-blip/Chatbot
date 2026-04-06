import { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setRole }) { // ✅ เพิ่ม setRole รับมาจาก App.jsx
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const API_URL = 'https://chatbot-5x95.onrender.com/api/auth/login';

      const res = await axios.post(API_URL, { username, password });
      console.log("ข้อมูลจาก Backend:", res.data);


      // ✅ ดึงค่า role จาก response (ดักไว้ทั้งแบบ res.data.role และ res.data.user.role)
      const userRole = res.data.role || (res.data.user && res.data.user.role);

      // ถ้าผ่าน เก็บ Token และ Role ลงเครื่อง
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', userRole); // ✅ บันทึก Role ลงเครื่อง

      // อัปเดต State
      setToken(res.data.token);
      setRole(userRole); // ✅ อัปเดต State ให้ App.jsx รู้ว่า User มีสิทธิ์อะไร

      alert("ยินดีต้อนรับสู่ Terminal Rama3! 🚀");
    } catch (err) {
      console.error("Login Error:", err);
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง! หรือเซิร์ฟเวอร์ขัดข้อง ❌");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#111] text-white">
      <form onSubmit={handleLogin} className="p-8 bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-800 w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Planner Login</h2>
        <input
          type="text" placeholder="Username"
          className="w-full p-3 mb-4 bg-black border border-gray-700 rounded focus:border-orange-500 outline-none"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password" placeholder="Password"
          className="w-full p-3 mb-6 bg-black border border-gray-700 rounded focus:border-orange-500 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-orange-600 hover:bg-orange-700 p-3 rounded font-bold transition-all">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}

export default Login;