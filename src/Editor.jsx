import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DashboardView from './DashboardView'; // นำเข้าหน้า Dashboard มาเพื่อทำ Preview

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default function Editor({ logout }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [topOrganic, setTopOrganic] = useState([]);
  const [topLike, setTopLike] = useState([]);
  const [topAds, setTopAds] = useState([]);

  const [newOrganic, setNewOrganic] = useState({ name: '', score: 0, image: '' });
  const [newLike, setNewLike] = useState({ name: '', score: 0, image: '' });
  const [newAds, setNewAds] = useState({ name: '', cost: 0, metricValue: 0, metricType: 'Reach', image: '' });

  // State สำหรับควบคุมการแสดงผลโหมด Preview
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const API_URL = 'https://chatbot-5x95.onrender.com/api/dashboard';

  useEffect(() => {
    axios
      .get(`${API_URL}?month=${month}`)
      .then((res) => {
        const data = res.data;
        setTopOrganic(data.topOrganic || []);
        setTopLike(data.topLike || []);
        setTopAds(data.topAds || []);
      })
      .catch((err) => console.error(err));
  }, [month]);

  const handleSaveData = async () => {
    try {
      await axios.post(API_URL, { month, topOrganic, topLike, topAds });
      alert(`💾 บันทึกข้อมูลประจำเดือน ${month} เรียบร้อยแล้ว!`);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (isPreviewMode) {
    return (
      <DashboardView 
        logout={logout} 
        onBack={() => setIsPreviewMode(false)}
      />
    );
  }

  // ------------------------- โหมด Editor ปกติ -------------------------
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-6 pb-32 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <h1 className="text-3xl font-bold text-white">⚙️ Editor Mode</h1>
          <div className="flex items-center space-x-4 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-white p-2 outline-none cursor-pointer"
            />
            <button
              onClick={() => setIsPreviewMode(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-bold shadow-lg transition"
            >
              👁️ Preview แดชบอร์ด
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-bold shadow-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 1. TOP Organic Posts */}
        <RankingSection
          title="🌱 1. เพิ่ม TOP Organic Posts"
          list={topOrganic}
          setList={setTopOrganic}
          newItem={newOrganic}
          setNewItem={setNewOrganic}
        />

        {/* 2. Top Like Of Month */}
        <RankingSection
          title="❤️ 2. เพิ่ม Top Like Of Month"
          list={topLike}
          setList={setTopLike}
          newItem={newLike}
          setNewItem={setNewLike}
        />

        {/* 3. Top Advertising (Ads) */}
        <AdsRankingSection
          title="📢 3. เพิ่ม Top Advertising (Ads)"
          list={topAds}
          setList={setTopAds}
          newItem={newAds}
          setNewItem={setNewAds}
        />

        {/* ปุ่ม Save */}
        <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-t border-neutral-800 p-6 flex justify-center z-50">
          <button
            onClick={handleSaveData}
            className="px-16 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-full shadow-2xl transition transform hover:-translate-y-1"
          >
            💾 บันทึกข้อมูลประจำเดือน {month}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Component ย่อย: สำหรับ Organic / Likes
// -------------------------------------------------------------------------
function RankingSection({ title, list, setList, newItem, setNewItem }) {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _list = [...list];
    const draggedItemContent = _list.splice(dragItem.current, 1)[0];
    _list.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setList(_list);
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      setNewItem({ ...newItem, image: base64 });
    }
  };

  const handleAdd = () => {
    if (!newItem.name) return;
    setList([...list, newItem]);
    setNewItem({ name: '', score: 0, image: '' });
  };

  return (
    <section className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h2 className="text-xl font-bold mb-6 text-green-400">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="ชื่อคอนเทนต์"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-4 text-white outline-none"
        />
        <input
          type="number"
          placeholder="ยอด (Views/Likes)"
          value={newItem.score || ''}
          onChange={(e) => setNewItem({ ...newItem, score: Number(e.target.value) })}
          className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-4 text-white outline-none"
        />
        
        {/* ✨ ออกแบบปุ่มอัปโหลดรูปภาพใหม่ ✨ */}
        <label className="flex items-center justify-center w-full bg-[#0a0a0a] border-2 border-dashed border-neutral-700 rounded-lg p-4 cursor-pointer hover:bg-neutral-800 hover:border-emerald-500 transition duration-200 group">
          <span className="text-xl mr-2 group-hover:scale-110 transition-transform">📸</span>
          <span className={`text-sm font-medium transition-colors truncate ${newItem.image ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-emerald-400'}`}>
            {newItem.image ? 'มีรูปภาพแล้ว (คลิกเปลี่ยน)' : 'อัปโหลดรูปภาพ'}
          </span>
          {/* ซ่อน input แบบเดิมไว้ */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg p-4 transition"
        >
          + เพิ่มเข้าตาราง
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
            <tr>
              <th className="p-4 w-24 text-center">อันดับ</th>
              <th className="p-4 w-24">รูปภาพ</th>
              <th className="p-4">ชื่อคอนเทนต์</th>
              <th className="p-4">ยอด</th>
              <th className="p-4 w-24 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {list.map((item, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="hover:bg-neutral-800 transition cursor-move bg-neutral-900 group"
              >
                <td className="p-4 text-center font-bold text-white">
                  <span className="text-neutral-600 mr-2">☰</span> #{index + 1}
                </td>
                <td className="p-4">
                  {item.image ? (
                    <img src={item.image} className="h-14 w-14 object-cover rounded shadow-md" alt="img" />
                  ) : (
                    <div className="h-14 w-14 bg-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-500">
                      No Img
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-emerald-400 text-lg font-mono">{item.score?.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setList(list.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
// Component ย่อย: สำหรับ Ads
// -------------------------------------------------------------------------
function AdsRankingSection({ title, list, setList, newItem, setNewItem }) {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _list = [...list];
    const draggedItemContent = _list.splice(dragItem.current, 1)[0];
    _list.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setList(_list);
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      setNewItem({ ...newItem, image: base64 });
    }
  };

  const handleAdd = () => {
    if (!newItem.name) return;
    setList([...list, newItem]);
    setNewItem({ name: '', cost: 0, metricValue: 0, metricType: 'Reach', image: '' });
  };

  return (
    <section className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h2 className="text-xl font-bold mb-6 text-blue-400">{title}</h2>
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="ชื่อแคมเปญ"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-4 text-white outline-none"
          />
          <input
            type="number"
            placeholder="Cost"
            value={newItem.cost || ''}
            onChange={(e) => setNewItem({ ...newItem, cost: Number(e.target.value) })}
            className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-4 text-white outline-none"
          />
          <input
            type="number"
            placeholder="ผลลัพธ์"
            value={newItem.metricValue || ''}
            onChange={(e) => setNewItem({ ...newItem, metricValue: Number(e.target.value) })}
            className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-4 text-white outline-none"
          />
          <select
            value={newItem.metricType}
            onChange={(e) => setNewItem({ ...newItem, metricType: e.target.value })}
            className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-4 text-white outline-none cursor-pointer"
          >
            <option value="Reach" className="bg-[#111] text-white">Reach</option>
            <option value="Follows" className="bg-[#111] text-white">Follows</option>
            <option value="Likes" className="bg-[#111] text-white">Likes</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ✨ ออกแบบปุ่มอัปโหลดรูปภาพใหม่ (ฝั่ง Ads) ✨ */}
          <label className="flex items-center justify-center w-full bg-[#0a0a0a] border-2 border-dashed border-neutral-700 rounded-lg p-4 cursor-pointer hover:bg-neutral-800 hover:border-blue-500 transition duration-200 group">
            <span className="text-xl mr-2 group-hover:scale-110 transition-transform">📸</span>
            <span className={`text-sm font-medium transition-colors truncate ${newItem.image ? 'text-blue-400' : 'text-neutral-400 group-hover:text-blue-400'}`}>
              {newItem.image ? 'มีรูปภาพแล้ว (คลิกเปลี่ยน)' : 'อัปโหลดรูปภาพแคมเปญ'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg p-4 transition"
          >
            + เพิ่มแคมเปญ
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
            <tr>
              <th className="p-4 text-center w-24">อันดับ</th>
              <th className="p-4 w-24">รูปภาพ</th>
              <th className="p-4">แคมเปญ</th>
              <th className="p-4">Cost (฿)</th>
              <th className="p-4">Result</th>
              <th className="p-4 text-center w-24">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {list.map((item, index) => (
              <tr
                key={index}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="hover:bg-neutral-800 transition cursor-move bg-neutral-900 group"
              >
                <td className="p-4 text-center font-bold text-white">
                  <span className="text-neutral-600 mr-2">☰</span> #{index + 1}
                </td>
                <td className="p-4">
                  {item.image ? (
                    <img src={item.image} className="h-14 w-14 object-cover rounded shadow-md" alt="img" />
                  ) : (
                    <div className="h-14 w-14 bg-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-500">
                      No Img
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-orange-400 text-lg font-mono">
                  {item.cost?.toLocaleString() || 0}
                </td>
                <td className="p-4 text-blue-400 text-lg font-mono">
                  {item.metricValue?.toLocaleString() || 0}
                  <span className="text-sm text-neutral-500 ml-2">{item.metricType}</span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setList(list.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}