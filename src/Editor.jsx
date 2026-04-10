import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DashboardView from './DashboardView';
import ManageData from './ManageData';

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
  const [platform, setPlatform] = useState('Facebook'); // เพิ่ม state สำหรับเลือกแพตฟอร์ม
  
  const [topOrganic, setTopOrganic] = useState([]);
  const [topLike, setTopLike] = useState([]);
  const [topAds, setTopAds] = useState([]);

  const [newOrganic, setNewOrganic] = useState({ name: '', score: 0, image: '' });
  const [newLike, setNewLike] = useState({ name: '', score: 0, image: '' });
  const [newAds, setNewAds] = useState({ name: '', cost: 0, metricValue: 0, metricType: 'Reach', image: '' });

  const [currentView, setCurrentView] = useState('editor');

  const API_URL = 'https://chatbot-5x95.onrender.com/api/dashboard';

  // ฟังก์ชันนี้ถูกเรียกเมื่อกดปุ่ม "แก้ไข" จากหน้า ManageData
  const handleEditData = async (compositeMonth) => {
    try {
      // ดึงข้อมูลตาม Composite Key (Month_Platform)
      const res = await axios.get(`${API_URL}?month=${compositeMonth}`);
      const data = res.data;
      
      // แยกข้อมูล Month และ Platform ออกจาก Composite Key
      const [baseMonth, plat] = compositeMonth.split('_');
      setMonth(baseMonth || compositeMonth); //Fallback ถ้าไม่มี _
      if (plat) setPlatform(plat);
      
      setTopOrganic(data.topOrganic || []);
      setTopLike(data.topLike || []);
      setTopAds(data.topAds || []);
      
      setCurrentView('editor');
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('ไม่สามารถดึงข้อมูลได้');
    }
  };

  // ฟังก์ชันบันทึกข้อมูล พร้อมเคลียร์หน้าจอเริ่มใหม่
  const handleSaveData = async () => {
    // รวมร่าง Month กับ Platform เป็น Key เดียวกันเพื่อให้ Backend เก็บแยกกันได้
    const compositeMonth = `${month}_${platform}`;
    
    try {
      await axios.post(API_URL, { 
        month: compositeMonth, 
        platform: platform, 
        topOrganic: topOrganic, 
        topLike: topLike, 
        topAds: topAds 
      });
      
      alert(`💾 บันทึกข้อมูลของ ${platform} ประจำเดือน ${month} เรียบร้อยแล้ว!`);
      
      setTopOrganic([]);
      setTopLike([]);
      setTopAds([]);
      setNewOrganic({ name: '', score: 0, image: '' });
      setNewLike({ name: '', score: 0, image: '' });
      setNewAds({ name: '', cost: 0, metricValue: 0, metricType: 'Reach', image: '' });

    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      console.error(error);
    }
  };

  // ---------------------------------------------------------
  // ควบคุมการแสดงผลหน้าจอ (Routing)
  // ---------------------------------------------------------
  if (currentView === 'preview') {
    return <DashboardView logout={logout} onBack={() => setCurrentView('editor')} />;
  }

  if (currentView === 'manage') {
    return (
      <ManageData 
        onBack={() => setCurrentView('editor')} 
        onEdit={handleEditData} 
        logout={logout}
      />
    );
  }

  // ---------------------------------------------------------
  // โหมด Editor หลัก
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-4 md:p-6 pb-32 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* === Header === */}
        <div className="flex flex-col lg:flex-row justify-between items-center border-b border-neutral-800 pb-4 gap-4">
          <h1 className="text-3xl font-bold text-white text-center w-full lg:w-auto">
            ⚙️ Editor Mode
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-neutral-900 p-2 rounded-lg border border-neutral-800 w-full lg:w-auto">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-neutral-800 text-white p-2 outline-none cursor-pointer border border-neutral-700 rounded-md text-sm"
            >
              <option value="Facebook">Platform: Facebook</option>
              <option value="Ig">Platform: Ig (Instagram)</option>
              <option value="Tiktok">Platform: Tiktok</option>
            </select>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-white p-2 outline-none cursor-pointer border border-neutral-700 rounded-md"
            />
            
            <button
              onClick={() => setCurrentView('manage')}
              className="px-4 py-2 md:px-6 md:py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs md:text-sm font-bold shadow-lg transition"
            >
              🛠️ จัดการข้อมูลเดิม
            </button>

            <button
              onClick={() => setCurrentView('preview')}
              className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-xs md:text-sm font-bold shadow-lg transition"
            >
              👁️ Preview
            </button>
            
            <button
              onClick={logout}
              className="px-4 py-2 md:px-6 md:py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs md:text-sm font-bold shadow-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* === Section 1: TOP Organic Posts (มีทุกอัน) === */}
        <RankingSection
          title={`🌱 1. เพิ่ม TOP Organic Posts (${platform})`}
          list={topOrganic}
          setList={setTopOrganic}
          newItem={newOrganic}
          setNewItem={setNewOrganic}
        />

        {/* === Section 2 & 3: แสดงเฉพาะ Facebook ตามเงื่อนไข === */}
        {platform === 'Facebook' && (
          <>
            {/* === Section 2: Top Like Of Month === */}
            <RankingSection
              title="❤️ 2. เพิ่ม Top Like Of Month"
              list={topLike}
              setList={setTopLike}
              newItem={newLike}
              setNewItem={setNewLike}
            />

            {/* === Section 3: Top Advertising (Ads) === */}
            <AdsRankingSection
              title="📢 3. เพิ่ม Top Advertising (Ads)"
              list={topAds}
              setList={setTopAds}
              newItem={newAds}
              setNewItem={setNewAds}
            />
          </>
        )}

        {/* === Footer ปุ่มบันทึก === */}
        <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-t border-neutral-800 p-4 md:p-6 flex justify-center z-50">
          <button
            onClick={handleSaveData}
            className="px-12 md:px-20 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-md md:text-lg rounded-full shadow-2xl transition transform hover:-translate-y-1"
          >
            💾 บันทึกข้อมูลและเริ่มใหม่
          </button>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// Component ย่อย: RankingSection
// =========================================================================
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
    if (!newItem.name) {
      alert("กรุณากรอกชื่อคอนเทนต์ก่อนเพิ่ม");
      return;
    }
    setList([...list, newItem]);
    setNewItem({ name: '', score: 0, image: '' });
  };

  const handleRemove = (indexToRemove) => {
    const updatedList = list.filter((_, index) => index !== indexToRemove);
    setList(updatedList);
  };

  return (
    <section className="bg-neutral-900 p-4 md:p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h2 className="text-lg md:text-xl font-bold mb-6 text-green-400">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="ชื่อคอนเทนต์"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white outline-none w-full"
        />
        
        <input
          type="number"
          placeholder="ยอด (Views/Likes)"
          value={newItem.score || ''}
          onChange={(e) => setNewItem({ ...newItem, score: Number(e.target.value) })}
          className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white outline-none w-full"
        />
        
        <label className="flex items-center justify-center w-full bg-[#0a0a0a] border-2 border-dashed border-neutral-700 rounded-lg p-3 cursor-pointer hover:bg-neutral-800 hover:border-emerald-500 transition duration-200 group">
          <span className="text-xl mr-2">📸</span>
          <span className={`text-xs md:text-sm font-medium transition-colors truncate ${newItem.image ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-emerald-400'}`}>
            {newItem.image ? 'มีรูปภาพแล้ว' : 'อัปโหลดรูปภาพ'}
          </span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg p-3 transition w-full"
        >
          + เพิ่มเข้าตาราง
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-300 min-w-[500px]">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
            <tr>
              <th className="p-4 w-16 md:w-24 text-center">อันดับ</th>
              <th className="p-4 w-16 md:w-24">รูปภาพ</th>
              <th className="p-4">ชื่อคอนเทนต์</th>
              <th className="p-4">ยอด</th>
              <th className="p-4 w-20 md:w-24 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {list.length === 0 && (
              <tr><td colSpan="5" className="text-center p-8 text-neutral-500">ยังไม่มีข้อมูลในตาราง</td></tr>
            )}
            {list.map((item, index) => (
              <tr key={index} draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className="hover:bg-neutral-800 transition cursor-move bg-neutral-900 group">
                <td className="p-4 text-center font-bold text-white"><span className="text-neutral-600 mr-2">☰</span> #{index + 1}</td>
                <td className="p-4">{item.image ? <img src={item.image} className="h-10 w-10 md:h-14 md:w-14 object-cover rounded shadow-md" alt="post preview" /> : <div className="h-10 w-10 md:h-14 md:w-14 bg-neutral-800 rounded flex items-center justify-center text-[8px] md:text-[10px] text-neutral-500">No Img</div>}</td>
                <td className="p-4 font-medium text-white">{item.name}</td>
                <td className="p-4 text-emerald-400 text-md md:text-lg font-mono">{item.score?.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleRemove(index)} className="text-red-500 hover:text-white hover:bg-red-600 border border-red-500/50 px-3 py-1 rounded transition font-bold text-xs md:text-sm">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// =========================================================================
// Component ย่อย: AdsRankingSection
// =========================================================================
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
    if (!newItem.name) {
      alert("กรุณากรอกชื่อแคมเปญก่อนเพิ่ม");
      return;
    }
    setList([...list, newItem]);
    setNewItem({ name: '', cost: 0, metricValue: 0, metricType: 'Reach', image: '' });
  };

  const handleRemove = (indexToRemove) => {
    const updatedList = list.filter((_, index) => index !== indexToRemove);
    setList(updatedList);
  };

  return (
    <section className="bg-neutral-900 p-4 md:p-8 rounded-2xl border border-neutral-800 shadow-xl">
      <h2 className="text-lg md:text-xl font-bold mb-6 text-blue-400">{title}</h2>
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input type="text" placeholder="ชื่อแคมเปญ" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white outline-none w-full" />
          <input type="number" placeholder="Cost (ค่าใช้จ่าย)" value={newItem.cost || ''} onChange={(e) => setNewItem({ ...newItem, cost: Number(e.target.value) })} className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white outline-none w-full" />
          <input type="number" placeholder="ผลลัพธ์ตัวเลข" value={newItem.metricValue || ''} onChange={(e) => setNewItem({ ...newItem, metricValue: Number(e.target.value) })} className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white outline-none w-full" />
          <select value={newItem.metricType} onChange={(e) => setNewItem({ ...newItem, metricType: e.target.value })} className="bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white outline-none cursor-pointer w-full">
            <option value="Reach" className="bg-[#111] text-white">Reach</option>
            <option value="Follows" className="bg-[#111] text-white">Follows</option>
            <option value="Likes" className="bg-[#111] text-white">Likes</option>
            <option value="Engagement" className="bg-[#111] text-white">Engagement</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-center w-full bg-[#0a0a0a] border-2 border-dashed border-neutral-700 rounded-lg p-3 cursor-pointer hover:bg-neutral-800 hover:border-blue-500 transition duration-200 group">
            <span className="text-xl mr-2">📸</span>
            <span className={`text-xs md:text-sm font-medium transition-colors truncate ${newItem.image ? 'text-blue-400' : 'text-neutral-400 group-hover:text-blue-400'}`}>
              {newItem.image ? 'มีรูปภาพแล้ว' : 'อัปโหลดรูปภาพแคมเปญ'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg p-3 transition w-full">+ เพิ่มแคมเปญ</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-300 min-w-[600px]">
          <thead className="bg-neutral-950 text-neutral-400 uppercase text-xs">
            <tr>
              <th className="p-4 text-center w-16 md:w-24">อันดับ</th>
              <th className="p-4 w-16 md:w-24">รูปภาพ</th>
              <th className="p-4">แคมเปญ</th>
              <th className="p-4">Cost (฿)</th>
              <th className="p-4">Result</th>
              <th className="p-4 text-center w-20 md:w-24">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {list.length === 0 && (<tr><td colSpan="6" className="text-center p-8 text-neutral-500">ยังไม่มีข้อมูลในตาราง</td></tr>)}
            {list.map((item, index) => (
              <tr key={index} draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className="hover:bg-neutral-800 transition cursor-move bg-neutral-900 group">
                <td className="p-4 text-center font-bold text-white"><span className="text-neutral-600 mr-2">☰</span> #{index + 1}</td>
                <td className="p-4">{item.image ? <img src={item.image} className="h-10 w-10 md:h-14 md:w-14 object-cover rounded shadow-md" alt="ad preview" /> : <div className="h-10 w-10 md:h-14 md:w-14 bg-neutral-800 rounded flex items-center justify-center text-[8px] md:text-[10px] text-neutral-500">No Img</div>}</td>
                <td className="p-4 font-medium text-white">{item.name}</td>
                <td className="p-4 text-orange-400 text-md md:text-lg font-mono">{item.cost?.toLocaleString() || 0}</td>
                <td className="p-4 text-blue-400 text-md md:text-lg font-mono">{item.metricValue?.toLocaleString() || 0} <span className="text-xs md:text-sm text-neutral-500 ml-1 md:ml-2">{item.metricType}</span></td>
                <td className="p-4 text-center">
                  <button onClick={() => handleRemove(index)} className="text-red-500 hover:text-white hover:bg-red-600 border border-red-500/50 px-3 py-1 rounded transition font-bold text-xs md:text-sm">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}