import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageData({ onEdit, onBack }) {
  const [savedMonths, setSavedMonths] = useState([]);
  const API_URL = 'https://chatbot-5x95.onrender.com/api';

  // ดึงรายชื่อเดือนทั้งหมดเมื่อเปิดหน้านี้
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

  // ฟังก์ชันลบเดือน
  const handleDelete = async (month) => {
    const isConfirm = window.confirm(`⚠️ คุณแน่ใจหรือไม่ที่จะลบข้อมูลของเดือน ${month} ทั้งหมด?\n(ไม่สามารถกู้คืนได้)`);
    if (!isConfirm) return;

    try {
      await axios.delete(`${API_URL}/dashboard?month=${month}`);
      alert(`🗑️ ลบข้อมูลเดือน ${month} สำเร็จ!`);
      fetchMonths(); // ดึงข้อมูลใหม่เพื่อรีเฟรชตาราง
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // ตัวช่วยแปลง Format เดือน
  const formatMonth = (monthString) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = monthString.split('-')[0];
    const monthIdx = parseInt(monthString.split('-')[1]) - 1;
    return `${monthNames[monthIdx]} ${year}`;
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
          <h2 className="text-xl font-bold mb-6 text-neutral-300">ประวัติการบันทึกข้อมูล</h2>
          
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
                <tr>
                  <th className="p-4 w-16 text-center">ลำดับ</th>
                  <th className="p-4">เดือน / ปี (Month)</th>
                  <th className="p-4 w-48 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {savedMonths.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center p-8 text-neutral-500">
                      ยังไม่มีข้อมูลที่บันทึกไว้ในระบบ
                    </td>
                  </tr>
                )}
                {savedMonths.map((item, index) => (
                  <tr key={item._id} className="hover:bg-neutral-800 transition bg-neutral-900">
                    <td className="p-4 text-center font-bold text-neutral-500">{index + 1}</td>
                    <td className="p-4 font-bold text-white text-lg">
                      {formatMonth(item.month)} <span className="text-sm font-normal text-neutral-500 ml-2">({item.month})</span>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(item.month)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold transition shadow-md"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(item.month)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold transition shadow-md"
                      >
                        🗑️ ลบ
                      </button>
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