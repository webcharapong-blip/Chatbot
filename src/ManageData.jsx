import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageData({ onEdit, onBack }) {
  const [savedMonths, setSavedMonths] = useState([]);
  const API_URL = 'https://chatbot-5x95.onrender.com/api';

  // ดึงรายชื่อเดือนทั้งหมด
  const fetchMonths = () => {
    axios
      .get(`${API_URL}/dashboards/all`)
      .then((res) => {
        setSavedMonths(res.data);
      })
      .catch((err) => console.error('Error fetching months:', err));
  };

  useEffect(() => {
    fetchMonths();
  }, []);

  // ฟังก์ชันลบข้อมูล (ส่งทั้ง ID และ Month)
  const handleDelete = async (id, month) => {
    const targetDisplay = month || "ข้อมูลไม่สมบูรณ์ (ID: " + id + ")";
    const isConfirm = window.confirm(`⚠️ คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${targetDisplay} ?\n(การกระทำนี้ไม่สามารถกู้คืนได้)`);
    
    if (!isConfirm) return;

    try {
      // ✨ ส่ง ID ไปลบใน Query String
      await axios.delete(`${API_URL}/dashboard?id=${id}`);
      alert(`🗑️ ลบข้อมูลเรียบร้อยแล้ว!`);
      fetchMonths(); // รีเฟรชรายการ
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + (error.response?.data?.error || error.message));
    }
  };

  // ✨ ตัวช่วยแปลงเดือน (มีตัวดักกันพัง)
  const formatMonth = (monthString) => {
    if (!monthString || typeof monthString !== 'string' || !monthString.includes('-')) {
      return "ข้อมูลไม่สมบูรณ์ (No Date)";
    }
    
    try {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const parts = monthString.split('-');
      const year = parts[0];
      const monthIdx = parseInt(parts[1]) - 1;
      return `${monthNames[monthIdx]} ${year}`;
    } catch (error) {
      return "Invalid Format";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <h1 className="text-3xl font-bold text-white">
            🛠️ จัดการข้อมูล (Manage Data)
          </h1>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md text-sm font-bold shadow-lg transition"
          >
            ← กลับไปหน้า Editor
          </button>
        </div>

        <section className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-neutral-300">รายการเดือนที่บันทึกไว้</h2>
          
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 w-16 text-center">#</th>
                  <th className="p-4">เดือน / ปี (Month)</th>
                  <th className="p-4 w-48 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {savedMonths.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center p-8 text-neutral-500">ยังไม่มีข้อมูลในระบบ</td>
                  </tr>
                )}
                {savedMonths.map((item, index) => (
                  <tr key={item._id} className="hover:bg-neutral-800/50 transition bg-neutral-900">
                    <td className="p-4 text-center font-bold text-neutral-500">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-lg">
                          {formatMonth(item.month)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {item.month || "ID: " + item._id}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            if(!item.month) return alert("ข้อมูลขยะไม่สามารถแก้ไขได้ กรุณาลบทิ้ง");
                            onEdit(item.month);
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold transition shadow-md"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.month)}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold transition shadow-md"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}