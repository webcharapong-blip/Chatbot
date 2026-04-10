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

  // ✨ ฟังก์ชันดาวน์โหลดข้อมูลรายเดือนแบบ Excel (พร้อมรูปภาพ)
  const handleDownload = async (monthKey) => {
    try {
      const res = await axios.get(`${API_URL}/dashboard?month=${monthKey}`);
      const data = res.data;
      if (!data) return alert("ไม่พบข้อมูล");

      const [baseMonth, platform] = monthKey.split('_');

      const createTableRows = (title, items, typeLabel) => {
        let rowsHtml = `<tr><td colspan="4" style="background-color: #4A4A4A; color: white; font-weight: bold; text-align: center; height: 30px;">${title}</td></tr>`;
        rowsHtml += `<tr style="background-color: #f2f2f2; font-weight: bold;"><td>Rank</td><td>Name</td><td>${typeLabel}</td><td>Image</td></tr>`;
        (items || []).forEach((item, idx) => {
          rowsHtml += `<tr>
            <td style="text-align: center;">Top ${idx+1}</td>
            <td>${item.name}</td>
            <td style="text-align: right;">${(item.score || item.metricValue || 0).toLocaleString()}</td>
            <td style="text-align: center;">${item.image ? `<img src="${item.image}" width="120" />` : "-"}</td>
          </tr>`;
        });
        return rowsHtml;
      };

      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"></head>
        <body>
          <h2>Backup Report: ${platform || 'Facebook'} (${baseMonth})</h2>
          <table border="1">
            ${createTableRows("Organic Posts", data.topOrganic, "Views")}
            ${(platform === 'Facebook' || !platform) ? `
              ${createTableRows("Likes", data.topLike, "Likes")}
              <tr><td colspan="4" style="background-color: #4A4A4A; color: white; font-weight: bold; text-align: center;">Advertising</td></tr>
              ${(data.topAds || []).map((item, idx) => `
                <tr>
                  <td>Top ${idx+1}</td>
                  <td>${item.name}</td>
                  <td>${item.metricValue?.toLocaleString()} ${item.metricType} (฿${item.cost?.toLocaleString()})</td>
                  <td>${item.image ? `<img src="${item.image}" width="120" />` : "-"}</td>
                </tr>
              `).join('')}
            ` : ""}
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Backup_${monthKey}.xls`);
      link.click();
    } catch (error) {
      alert("ดาวน์โหลดไม่สำเร็จ: " + error.message);
    }
  };

  // ✨ ตัวช่วยแปลงเดือน (รองรับ Composite Key)
  const formatMonth = (monthString) => {
    if (!monthString || typeof monthString !== 'string') {
      return "ข้อมูลไม่สมบูรณ์";
    }
    
    // แยกเอาแค่ YYYY-MM ออกมา (กรณีมี _Platform ต่อท้าย)
    const baseMonth = monthString.split('_')[0];
    
    if (!baseMonth.includes('-')) return baseMonth;
    
    try {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const parts = baseMonth.split('-');
      const year = parts[0];
      const monthIdx = parseInt(parts[1]) - 1;
      return `${monthNames[monthIdx]} ${year}`;
    } catch (error) {
      return baseMonth;
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
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-neutral-500 uppercase tracking-tighter">
                            {item.month?.split('_')[0] || "No Date"}
                          </span>
                          {/* แสดง Badge แพลตฟอร์ม โดยเช็คจาก item.platform หรือจากตัวท้ายของ month string */}
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-400 font-bold">
                            {item.platform || (item.month?.includes('_') ? item.month.split('_')[1] : 'Facebook')}
                          </span>
                        </div>
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
                          onClick={() => handleDownload(item.month)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold transition shadow-md"
                        >
                          📥 โหลด
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