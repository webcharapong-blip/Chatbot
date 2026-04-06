import React, { useState, useEffect } from 'react';

export default function Editor({ logout }) {
  const [kpis, setKpis] = useState({ totalPosts: 0, totalAds: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ name: '', score: 0, reach: 0 });

  // โหลดข้อมูลเดิมขึ้นมาแสดงตอนเปิดหน้า
  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setKpis(data.kpis || { totalPosts: 0, totalAds: 0 });
        setCampaigns(data.campaigns || []);
      });
  }, []);

  const handleKpiChange = (e) => {
    setKpis({ ...kpis, [e.target.name]: Number(e.target.value) });
  };

  const handleAddCampaign = () => {
    if (!newCampaign.name) return;
    const updatedCampaigns = [...campaigns, newCampaign];
    // จัดเรียงลำดับตามคะแนน (score) ทันทีที่หน้า UI
    updatedCampaigns.sort((a, b) => b.score - a.score);
    setCampaigns(updatedCampaigns);
    setNewCampaign({ name: '', score: 0, reach: 0 }); // reset form
  };

  const handleRemoveCampaign = (index) => {
    const updated = campaigns.filter((_, i) => i !== index);
    setCampaigns(updated);
  };

  const handleSaveData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kpis, campaigns })
      });
      if (response.ok) {
        alert('บันทึกลง MongoDB เรียบร้อยแล้ว!');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-neutral-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-bold text-white">⚙️ ระบบจัดการข้อมูล (Editor)</h1>
          <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition">
            ออกจากระบบ
          </button>
        </div>

        {/* 1. ส่วนกรอกภาพรวม KPI */}
        <section className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">📊 1. ภาพรวมยอดโพสต์ & ยอดยิงแอด</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">ยอดโพสต์รวม</label>
              <input 
                type="number" name="totalPosts" value={kpis.totalPosts} onChange={handleKpiChange}
                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">ยอดยิงแอดรวม</label>
              <input 
                type="number" name="totalAds" value={kpis.totalAds} onChange={handleKpiChange}
                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* 2. ส่วนกรอกแคมเปญและจัดอันดับ */}
        <section className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">🏆 2. เพิ่มแคมเปญ (จัดอันดับตามตัวเลข)</h2>
          
          {/* Form เพิ่มข้อมูล */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input 
              type="text" placeholder="ชื่อแคมเปญ" value={newCampaign.name}
              onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
              className="bg-[#0a0a0a] border border-neutral-700 rounded p-3 text-white"
            />
            <input 
              type="number" placeholder="ตัวเลขวัดผล (ใช้อันดับ)" value={newCampaign.score || ''}
              onChange={(e) => setNewCampaign({...newCampaign, score: Number(e.target.value)})}
              className="bg-[#0a0a0a] border border-neutral-700 rounded p-3 text-white"
            />
            <button 
              onClick={handleAddCampaign}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded p-3 transition">
              + เพิ่มเข้าตาราง
            </button>
          </div>

          {/* Table แสดงผล */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400">
                <tr>
                  <th className="p-3 rounded-tl-lg">อันดับ</th>
                  <th className="p-3">ชื่อแคมเปญ</th>
                  <th className="p-3">คะแนน (ตัวชี้วัด)</th>
                  <th className="p-3 rounded-tr-lg text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 && (
                  <tr><td colSpan="4" className="text-center p-4 text-neutral-500">ยังไม่มีข้อมูลแคมเปญ</td></tr>
                )}
                {campaigns.map((camp, index) => (
                  <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                    <td className="p-3 font-bold text-white">#{index + 1}</td>
                    <td className="p-3">{camp.name}</td>
                    <td className="p-3 text-emerald-400">{camp.score.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleRemoveCampaign(index)} className="text-red-400 hover:text-red-300">ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ปุ่ม Save */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveData}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-1">
            💾 บันทึกข้อมูลขึ้นระบบ (Sync to Dashboard)
          </button>
        </div>

      </div>
    </div>
  );
}