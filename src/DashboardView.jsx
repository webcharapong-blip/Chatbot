import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardView({ logout, onBack }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`https://chatbot-5x95.onrender.com/api/dashboard?month=${month}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
      });
  }, [month]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const year = month.split('-')[0];
  const monthString = month.split('-')[1];
  const displayMonth = `${monthNames[parseInt(monthString) - 1]} ${year}`;

  // ----------------------------------------------------------------------
  // ✨ อัปเดตใหม่: ฟังก์ชันจัดเรียงข้อมูลจากมากไปน้อย (Auto Sort) ก่อนแสดงผล
  // ----------------------------------------------------------------------
  const sortedOrganic = data?.topOrganic 
    ? [...data.topOrganic].sort((a, b) => b.score - a.score) 
    : [];

  const sortedLike = data?.topLike 
    ? [...data.topLike].sort((a, b) => b.score - a.score) 
    : [];

  const sortedAds = data?.topAds 
    ? [...data.topAds].sort((a, b) => b.metricValue - a.metricValue) 
    : [];
  // ----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#C8D5B9] text-neutral-900 font-sans p-8 pb-24 relative overflow-hidden">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#3A4B3C] mb-4 md:mb-0 drop-shadow-sm">
          Data Analytics Dashboard
        </h1>
        
        <div className="flex gap-4 items-center">
          <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-md border border-white/40 flex items-center">
            <label className="font-bold mr-3 text-neutral-700">Select Month:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent outline-none font-medium cursor-pointer text-neutral-800"
            />
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-md transition transform hover:-translate-y-0.5"
            >
              ✏️ กลับไปหน้า Editor
            </button>
          )}

          <button
            onClick={logout}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-bold shadow-md transition transform hover:-translate-y-0.5"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg text-center border-b-8 border-emerald-500 transform transition hover:-translate-y-1">
            <p className="text-gray-500 font-bold mb-2 text-lg uppercase tracking-wider">Total Result</p>
            <p className="text-5xl font-black text-[#2C3B2E]">{data?.kpis?.totalResult?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg text-center border-b-8 border-blue-500 transform transition hover:-translate-y-1">
            <p className="text-gray-500 font-bold mb-2 text-lg uppercase tracking-wider">Advertising</p>
            <p className="text-5xl font-black text-[#2C3B2E]">{data?.kpis?.totalAdvertising?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Section 1: TOP Organic Posts */}
        <section className="mb-24 relative">
          <div className="flex justify-start mb-10">
            <h2 className="bg-[#4A4A4A] text-white text-3xl font-bold py-3 px-8 rounded-xl shadow-md">
              TOP Organic Posts
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {/* ดึงตัวที่จัดเรียงแล้วมาแสดงแทน */}
            {sortedOrganic.slice(0, 3).map((item, idx) => (
              <RankingCard key={idx} index={idx} item={item} label="Views" month={displayMonth} />
            ))}
            {sortedOrganic.length === 0 && (
              <p className="text-neutral-600 font-medium italic col-span-3 text-center py-10">ยังไม่มีข้อมูลออร์แกนิกในเดือนนี้</p>
            )}
          </div>

          <div className="flex justify-center mt-14">
            <span className="bg-[#4A4A4A] text-white text-2xl font-bold py-3 px-10 rounded-xl shadow-md tracking-wide">
              Update {displayMonth}
            </span>
          </div>
        </section>

        {/* Section 2: Top Like Of Month */}
        <section className="mb-24 relative">
          <div className="flex justify-start mb-10">
            <h2 className="bg-[#4A4A4A] text-white text-3xl font-bold py-3 px-8 rounded-xl shadow-md">
              Top Like Of Month
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {/* ดึงตัวที่จัดเรียงแล้วมาแสดงแทน */}
            {sortedLike.slice(0, 3).map((item, idx) => (
              <RankingCard key={idx} index={idx} item={item} label="Likes" month={displayMonth} />
            ))}
            {sortedLike.length === 0 && (
              <p className="text-neutral-600 font-medium italic col-span-3 text-center py-10">ยังไม่มีข้อมูลยอดไลก์ในเดือนนี้</p>
            )}
          </div>

          <div className="flex justify-center mt-14">
            <span className="bg-[#4A4A4A] text-white text-2xl font-bold py-3 px-10 rounded-xl shadow-md tracking-wide">
              Update {displayMonth}
            </span>
          </div>
        </section>

        {/* Section 3: Total Result , Advertising (Ads) */}
        <section className="mb-10 relative">
          <div className="flex justify-start mb-10">
            <h2 className="bg-[#4A4A4A] text-white text-3xl font-bold py-3 px-8 rounded-xl shadow-md">
              Total Result , Advertising
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {/* ดึงตัวที่จัดเรียงแล้วมาแสดงแทน */}
            {sortedAds.slice(0, 3).map((item, idx) => (
              <AdsCard key={idx} index={idx} item={item} month={displayMonth} />
            ))}
            {sortedAds.length === 0 && (
              <p className="text-neutral-600 font-medium italic col-span-3 text-center py-10">ยังไม่มีข้อมูลแคมเปญโฆษณาในเดือนนี้</p>
            )}
          </div>

          <div className="flex justify-center mt-14">
            <span className="bg-[#4A4A4A] text-white text-2xl font-bold py-3 px-10 rounded-xl shadow-md tracking-wide">
              Update {displayMonth}
            </span>
          </div>
        </section>

      </div>
    </div>
  );
}

// =========================================================================
// Component ย่อย: AdsCard
// =========================================================================
function AdsCard({ index, item, month }) {
  return (
    <div className="flex flex-col items-center group w-full">
      <div className="text-center mb-5 w-full">
        <h3 className="text-2xl font-black text-[#111] mb-1">
          Top {index + 1}
        </h3>
        <p className="text-xl font-bold text-[#111]">
          ค่าใช้จ่าย : {item.cost ? item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
        </p>
        <p className="text-xl font-bold text-[#111]">
          {item.metricType || 'Reach'} : {item.metricValue ? item.metricValue.toLocaleString() : '0'}
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white transition-transform duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="p-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
            T21
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
            <p className="text-[11px] text-gray-500 font-medium">Sponsored • {month}</p>
          </div>
        </div>

        <div className="w-full h-[380px] bg-gray-50 flex items-center justify-center relative">
          {item.image ? (
            <img src={item.image} className="w-full h-full object-cover object-top" alt="Ad Post" />
          ) : (
            <div className="text-gray-400 font-medium flex flex-col items-center">
              <span className="text-3xl mb-2">📷</span>
              <span>No Image Uploaded</span>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 text-gray-500 text-sm flex justify-between bg-gray-50">
          <span className="flex items-center gap-1.5 font-medium">👍 1.5K</span>
          <span className="flex items-center gap-1.5 font-medium">💬 30</span>
          <span className="flex items-center gap-1.5 font-medium">↪️ 112</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Component ย่อย: RankingCard
// =========================================================================
function RankingCard({ index, item, label, month }) {
  return (
    <div className="flex flex-col items-center group w-full">
      <div className="text-center mb-5 w-full">
        <h3 className="text-2xl font-black text-[#111] mb-1">
          Top {index + 1}
        </h3>
        <p className="text-xl font-bold text-[#111]">
          {label} : {item.score ? item.score.toLocaleString() : '0'}
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white transition-transform duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="p-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm border border-emerald-200">
            T21
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
            <p className="text-[11px] text-gray-500 font-medium">Update • {month}</p>
          </div>
        </div>

        <div className="w-full h-[380px] bg-gray-50 flex items-center justify-center relative">
          {item.image ? (
            <img src={item.image} className="w-full h-full object-cover object-top" alt="Organic Post" />
          ) : (
            <div className="text-gray-400 font-medium flex flex-col items-center">
              <span className="text-3xl mb-2">📷</span>
              <span>No Image Uploaded</span>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 text-gray-500 text-sm flex justify-between bg-gray-50">
          <span className="flex items-center gap-1.5 font-medium">👍 Like</span>
          <span className="flex items-center gap-1.5 font-medium">💬 Comment</span>
          <span className="flex items-center gap-1.5 font-medium">↪️ Share</span>
        </div>
      </div>
    </div>
  );
}