import axios from 'axios';
import { useState, useEffect } from 'react';

function Login({ setToken, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.post('https://chatbot-5x95.onrender.com/api/auth/login', {}).catch(() => { });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = 'https://chatbot-5x95.onrender.com/api/auth/login';

      const res = await axios.post(API_URL, { username, password });
      console.log("ข้อมูลจาก Backend:", res.data);

      const userRole = res.data.role || (res.data.user && res.data.user.role);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', userRole);

      setToken(res.data.token);
      setRole(userRole);

      alert("ยินดีต้อนรับสู่ Terminal Rama3! 🚀");
    } catch (err) {
      console.error("Login Error:", err);
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง! หรือเซิร์ฟเวอร์ขัดข้อง ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#111] text-white">
      <form onSubmit={handleLogin} className="p-8 bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-800 w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Planner Login</h2>
        <input
          type="text"
          placeholder="Username"
          disabled={loading}
          className="w-full p-3 mb-4 bg-black border border-gray-700 rounded focus:border-orange-500 outline-none disabled:opacity-50"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          disabled={loading}
          className="w-full p-3 mb-6 bg-black border border-gray-700 rounded focus:border-orange-500 outline-none disabled:opacity-50"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 p-3 rounded font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            'เข้าสู่ระบบ'
          )}
        </button>
      </form>
    </div>
  );
}

export default Login;