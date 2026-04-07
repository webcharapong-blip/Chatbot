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

  const sortedOrganic = data?.topOrganic 
    ? [...data.topOrganic].sort((a, b) => b.score - a.score) 
    : [];

  const sortedLike = data?.topLike 
    ? [...data.topLike].sort((a, b) => b.score - a.score) 
    : [];

  const sortedAds = data?.topAds 
    ? [...data.topAds].sort((a, b) => b.metricValue - a.metricValue) 
    : [];

  return (
    <div className="min-h-screen bg-[#C8D5B9] text-neutral-900 font-sans p-4 md:p-8 pb-24 relative overflow-hidden">
      
      {/* -------------------------------------------------------------
          Header 
      ------------------------------------------------------------- */}
      <header className="flex flex-col lg:flex-row justify-between items-center mb-12 max-w-7xl mx-auto relative z-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#3A4B3C] drop-shadow-sm text-center lg:text-left">
          Data Analytics Dashboard
        </h1>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 items-center">
          
          <div className="bg-white/80 backdrop-blur-md px-4 md:px-5 py-2 md:py-3 rounded-full shadow-md border border-white/40 flex items-center">
            <label className="font-bold mr-2 md:mr-3 text-neutral-700 text-sm md:text-base">Select Month:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent outline-none font-medium cursor-pointer text-neutral-800 text-sm md:text-base"
            />
          </div>

          {/* 👁️ จะแสดงปุ่ม 'กลับไปหน้า Editor' ก็ต่อเมื่อเข้าจากโหมด Editor (มีส่ง onBack มา) */}
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-md transition transform hover:-translate-y-0.5 text-sm md:text-base"
            >
              ✏️ กลับไปหน้า Editor
            </button>
          )}

          {/* 🚪 จะแสดงปุ่ม 'Logout' สีดำนี้ ก็ต่อเมื่อเข้าจากโหมด Editor เท่านั้น!
              (ถ้าเข้าจาก Viewer/Planner ปุ่มนี้จะหายไปไม่ให้ซ้ำซ้อน) */}
          {logout && (
            <button
              onClick={logout}
              className="px-4 py-2 md:px-6 md:py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-bold shadow-md transition transform hover:-translate-y-0.5 text-sm md:text-base"
            >
              Logout
            </button>
          )}

        </div>
      </header>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-16 md:mb-20 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg text-center border-b-8 border-emerald-500 transform transition hover:-translate-y-1">
            <p className="text-gray-500 font-bold mb-1 md:mb-2 text-sm md:text-lg uppercase tracking-wider">Total Result</p>
            <p className="text-4xl md:text-5xl font-black text-[#2C3B2E]">{data?.kpis?.totalResult?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg text-center border-b-8 border-blue-500 transform transition hover:-translate-y-1">
            <p className="text-gray-500 font-bold mb-1 md:mb-2 text-sm md:text-lg uppercase tracking-wider">Advertising</p>
            <p className="text-4xl md:text-5xl font-black text-[#2C3B2E]">{data?.kpis?.totalAdvertising?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Section 1: TOP Organic Posts */}
        <section className="mb-16 md:mb-24 relative">
          <div className="flex justify-center md:justify-start mb-8 md:mb-10">
            <h2 className="bg-[#4A4A4A] text-white text-xl md:text-3xl font-bold py-2 md:py-3 px-6 md:px-8 rounded-xl shadow-md text-center">
              TOP Organic Posts
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
            {sortedOrganic.slice(0, 3).map((item, idx) => (
              <RankingCard key={idx} index={idx} item={item} label="Views" month={displayMonth} />
            ))}
            {sortedOrganic.length === 0 && (
              <p className="text-neutral-600 font-medium italic col-span-full text-center py-10">ยังไม่มีข้อมูลออร์แกนิกในเดือนนี้</p>
            )}
          </div>

          <div className="flex justify-center mt-10 md:mt-14">
            <span className="bg-[#4A4A4A] text-white text-lg md:text-2xl font-bold py-2 md:py-3 px-6 md:px-10 rounded-xl shadow-md tracking-wide">
              Update {displayMonth}
            </span>
          </div>
        </section>

        {/* Section 2: Total Result , Advertising (Ads) */}
        <section className="mb-10 relative">
          <div className="flex justify-center md:justify-start mb-8 md:mb-10">
            <h2 className="bg-[#4A4A4A] text-white text-xl md:text-3xl font-bold py-2 md:py-3 px-6 md:px-8 rounded-xl shadow-md text-center">
              Total Result , Advertising
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
            {sortedAds.slice(0, 3).map((item, idx) => (
              <AdsCard key={idx} index={idx} item={item} month={displayMonth} />
            ))}
            {sortedAds.length === 0 && (
              <p className="text-neutral-600 font-medium italic col-span-full text-center py-10">ยังไม่มีข้อมูลแคมเปญโฆษณาในเดือนนี้</p>
            )}
          </div>

          <div className="flex justify-center mt-10 md:mt-14">
            <span className="bg-[#4A4A4A] text-white text-lg md:text-2xl font-bold py-2 md:py-3 px-6 md:px-10 rounded-xl shadow-md tracking-wide">
              Update {displayMonth}
            </span>
          </div>
        </section>

        {/* Section 3: Top Like Of Month */}
        <section className="mb-16 md:mb-24 relative">
          <div className="flex justify-center md:justify-start mb-8 md:mb-10">
            <h2 className="bg-[#4A4A4A] text-white text-xl md:text-3xl font-bold py-2 md:py-3 px-6 md:px-8 rounded-xl shadow-md text-center">
              Top Like Of Month
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
            {sortedLike.slice(0, 3).map((item, idx) => (
              <RankingCard key={idx} index={idx} item={item} label="Likes" month={displayMonth} />
            ))}
            {sortedLike.length === 0 && (
              <p className="text-neutral-600 font-medium italic col-span-full text-center py-10">ยังไม่มีข้อมูลยอดไลก์ในเดือนนี้</p>
            )}
          </div>

          <div className="flex justify-center mt-10 md:mt-14">
            <span className="bg-[#4A4A4A] text-white text-lg md:text-2xl font-bold py-2 md:py-3 px-6 md:px-10 rounded-xl shadow-md tracking-wide">
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
      <div className="text-center mb-4 md:mb-5 w-full">
        <h3 className="text-xl md:text-2xl font-black text-[#111] mb-1">
          Top {index + 1}
        </h3>
        <p className="text-md md:text-xl font-bold text-[#111]">
          ค่าใช้จ่าย : {item.cost ? item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
        </p>
        <p className="text-md md:text-xl font-bold text-[#111]">
          {item.metricType || 'Reach'} : {item.metricValue ? item.metricValue.toLocaleString() : '0'}
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white transition-transform duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="p-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200 shrink-0">
            T21
          </div>
          <div className="overflow-hidden">
            <p className="text-xs md:text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
            <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">Sponsored • {month}</p>
          </div>
        </div>

        <div className="w-full h-[300px] md:h-[380px] bg-gray-50 flex items-center justify-center relative">
          {item.image ? (
            <img src={item.image} className="w-full h-full object-cover object-top" alt="Ad Post" />
          ) : (
            <div className="text-gray-400 font-medium flex flex-col items-center">
              <span className="text-3xl mb-2">📷</span>
              <span className="text-sm">No Image</span>
            </div>
          )}
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
      <div className="text-center mb-4 md:mb-5 w-full">
        <h3 className="text-xl md:text-2xl font-black text-[#111] mb-1">
          Top {index + 1}
        </h3>
        <p className="text-md md:text-xl font-bold text-[#111]">
          {label} : {item.score ? item.score.toLocaleString() : '0'}
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white transition-transform duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="p-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm border border-emerald-200 shrink-0">
            T21
          </div>
          <div className="overflow-hidden">
            <p className="text-xs md:text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
            <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">Update • {month}</p>
          </div>
        </div>

        <div className="w-full h-[300px] md:h-[380px] bg-gray-50 flex items-center justify-center relative">
          {item.image ? (
            <img src={item.image} className="w-full h-full object-cover object-top" alt="Organic Post" />
          ) : (
            <div className="text-gray-400 font-medium flex flex-col items-center">
              <span className="text-3xl mb-2">📷</span>
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}