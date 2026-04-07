import { useState } from 'react';
import Login from './Login';
import Editor from './Editor';
import Dashboard from './Dashboard'; // 👈 นำเข้าไฟล์ Dashboard.jsx ที่เราเพิ่งแก้

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  return (
    <div className="min-h-screen bg-[#111]">
      {!token ? (
        <Login setToken={setToken} setRole={setRole} />
      ) : role === 'editor' ? (
        <Editor logout={handleLogout} />
      ) : (
        // 👈 ตรงนี้สำคัญมาก! ให้คนดูไปที่หน้า Dashboard (Looker) ไม่ใช่ DashboardView
        <Dashboard logout={handleLogout} />
      )}
    </div>
  );
}

export default App;