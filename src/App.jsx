import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Editor from './Editor'; // อย่าลืม import ไฟล์ Editor เข้ามาด้วยนะครับ

function App() {
  // ดึงข้อมูล token และ role จาก localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role')); // เพิ่ม state สำหรับเก็บสิทธิ์

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // ลบ role ออกด้วย
    setToken(null);
    setRole(null);
  };

  return (
    <div className="min-h-screen bg-[#111]">
      {!token ? (
        // ส่ง setToken และ setRole ไปให้หน้า Login เพื่ออัปเดต state เมื่อล็อกอินสำเร็จ
        <Login setToken={setToken} setRole={setRole} />
      ) : role === 'editor' ? (
        // ถ้าล็อกอินแล้ว และ role เป็น 'editor' ให้ไปหน้า Editor
        <Editor logout={handleLogout} />
      ) : (
        // ถ้าล็อกอินแล้ว แต่ role เป็นอย่างอื่น (เช่น 'viewer') ให้ไปหน้า Dashboard
        <Dashboard logout={handleLogout} />
      )}
    </div>
  );
}

export default App;