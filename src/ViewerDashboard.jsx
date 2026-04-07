import React, { useState } from 'react';
import { Bubble } from "@typebot.io/react";
import DashboardView from './DashboardView'; // นำเข้าหน้า Custom Dashboard

export default function ViewerDashboard({ logout }) {
  // State ควบคุมหน้าจอ: 'looker' (ค่าเริ่มต้น) หรือ 'custom'
  const [activeTab, setActiveTab] = useState('looker');

  // URL ของ Looker Studio
  const LOOKER_URL = "https://lookerstudio.google.com/embed/reporting/1c957686-c20f-4d3c-889c-39f42fd5978b/page/p_qh9g0zh00d";

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-neutral-100 overflow-hidden font-sans">
      
      {/* --- Header: ปรับให้ยืดหยุ่นบนมือถือ --- */}
      <header className="sticky top-0 z-50 flex flex-col md:flex-row md:items-center justify-between px-3 md:px-6 py-3 bg-[#111]/90 backdrop-blur-md border-b border-white/5 shadow-xl gap-3 md:gap-0">
        
        {/* ส่วน Logo และชื่อ */}
        <div className="flex items-center gap-3 justify-between md:justify-start w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <img
                src="/unnamed.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[10px] md:text-sm font-bold tracking-[0.1em] uppercase text-white/90 leading-tight">
                Terminal Rama3 <span className="text-orange-500 hidden sm:inline">●</span>
              </h1>
              <p className="text-[8px] md:text-[10px] text-neutral-500 font-medium tracking-wider uppercase opacity-80">
                Operations <span className="hidden sm:inline">Dashboard</span>
              </p>
            </div>
          </div>
          
          {/* ปุ่ม Logout (แสดงบนมือถือ ขวาบน) */}
          <button
            onClick={logout}
            className="md:hidden bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 px-3 py-1.5 rounded-md text-[9px] font-bold tracking-widest uppercase transition-all duration-300"
          >
            Logout
          </button>
        </div>

        {/* 🆕 ส่วน Tabs สำหรับสลับหน้า (อยู่ตรงกลาง) */}
        <div className="flex justify-center w-full md:w-auto">
          <div className="bg-[#1A1A1A] p-1 rounded-lg flex gap-1 border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('looker')}
              className={`px-4 py-2 md:px-6 md:py-2 rounded-md text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${
                activeTab === 'looker' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              📈 Looker Studio
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 md:px-6 md:py-2 rounded-md text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${
                activeTab === 'custom' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              ⭐ Custom Dashboard
            </button>
          </div>
        </div>

        {/* ปุ่ม Logout (แสดงบนคอมพิวเตอร์ ขวาสุด) */}
        <button
          onClick={logout}
          className="hidden md:block bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 px-4 py-2 rounded-md text-[11px] font-bold tracking-widest uppercase transition-all duration-300"
        >
          Logout
        </button>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow overflow-y-auto bg-[#050505] custom-scrollbar pb-20 md:pb-6 relative">
        
        {/* 🔄 เงื่อนไขการสลับหน้า 🔄 */}
        {activeTab === 'looker' ? (
          // 📊 แสดงหน้า Looker Studio (ดีไซน์เดิมของคุณ)
          <div className="w-full max-w-[100%] md:max-w-[95%] mx-auto p-2 md:p-6 mt-2">
            <div className="mb-3 px-1 flex justify-between items-end">
              <div>
                <h2 className="text-sm md:text-xl font-bold text-white tracking-tight">Main Analytics</h2>
                <p className="text-[8px] md:text-[10px] text-neutral-500 uppercase tracking-widest">Live Monitoring</p>
              </div>
            </div>

            <div className="relative w-full rounded-xl md:rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl">
              <div className="h-[60vh] md:h-[75vh] min-h-[400px]">
                <iframe
                  src={LOOKER_URL}
                  className="w-full h-full border-0"
                  allowFullScreen
                  sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                ></iframe>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-6">
              <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg bg-white/5 border border-white/5 text-[8px] md:text-[10px] text-neutral-500 flex justify-between items-center tracking-widest uppercase">
                STORAGE: <span className="text-green-500 font-bold">Optimal</span>
              </div>
              <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg bg-white/5 border border-white/5 text-[8px] md:text-[10px] text-neutral-500 flex justify-between items-center tracking-widest uppercase">
                Latency: <span className="text-orange-500 font-bold">24ms</span>
              </div>
              <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg bg-white/5 border border-white/5 text-[8px] md:text-[10px] text-neutral-500 flex justify-between items-center tracking-widest uppercase">
                Security: <span className="text-blue-500 font-bold">Encrypted</span>
              </div>
            </div>
          </div>
        ) : (
          // ⭐ แสดงหน้า Custom Dashboard ของเรา
          <div className="w-full h-full">
            <DashboardView />
          </div>
        )}
      </main>

      {/* --- Chatbot --- */}
      <Bubble
        typebot="pattayapal"
        apiHost="https://typebot.io"
        theme={{
          button: { backgroundColor: "#f97316", size: "medium" },
          chatWindow: { backgroundColor: "#ffffff" }
        }}
      />
    </div>
  );
}