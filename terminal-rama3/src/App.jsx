import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard'; // ดึงไฟล์ Dashboard.jsx มาใช้งาน

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-[#111]">
      {!token ? (
        // ส่งฟังก์ชัน setToken ไปให้หน้า Login ใช้หลังจากล็อกอินสำเร็จ
        <Login setToken={setToken} />
      ) : (
        // ส่งฟังก์ชัน handleLogout ไปให้หน้า Dashboard ไว้กดปุ่ม Logout
        <Dashboard logout={handleLogout} />
      )}
    </div>
  );
}

export default App;