import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  CheckSquare,
  Cpu,
  FileText,
  Globe,
  HelpCircle,
  Mail,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      title: 'Supervisor Agent',
      desc: 'Mengawasi alur kerja tim dan memberikan rekomendasi prioritas tugas secara cerdas.',
      icon: <Activity className="w-6 h-6 text-[#ff623d]" />,
      visual: (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center">
          {/* Radar Scanning Visual */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,67,34,0.15)_0%,transparent_70%)]" />
          <div className="relative w-28 h-28 border border-[#ff623d]/20 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-[#ff623d]/30 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 border border-[#ff623d]/40 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#ff623d] rounded-full animate-ping" />
              </div>
            </div>
            {/* Scanning line */}
            <div className="absolute inset-0 border-t-2 border-[#ff623d]/60 rounded-full animate-spin [animation-duration:4s]" />
            {/* Blips */}
            <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-[#ff623d] rounded-full animate-pulse" />
            <div className="absolute bottom-6 right-8 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse [animation-delay:1s]" />
            <div className="absolute top-10 right-4 w-2 h-2 bg-[#ff623d] rounded-full animate-pulse [animation-delay:0.5s]" />
          </div>
        </div>
      ),
    },
    {
      title: 'Knowledge Agent',
      desc: 'Akses cepat ke dokumentasi internal dan pengetahuan korporat tanpa harus mencari manual.',
      icon: <Sparkles className="w-6 h-6 text-[#ff623d]" />,
      visual: (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center">
          {/* Connected Network Nodes */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
          <svg className="w-32 h-32 text-slate-700" viewBox="0 0 100 100">
            {/* Lines */}
            <line x1="50" y1="50" x2="20" y2="30" stroke="currentColor" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="80" y2="30" stroke="currentColor" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="30" y2="75" stroke="currentColor" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="70" y2="75" stroke="currentColor" strokeWidth="0.5" />
            <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
            <line x1="30" y1="75" x2="70" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" />
            {/* Nodes */}
            <circle cx="50" cy="50" r="6" className="fill-[#ff623d] stroke-[#ff623d]/30 stroke-[4px]" />
            <circle cx="20" cy="30" r="4" className="fill-slate-600 hover:fill-[#ff623d] transition-colors" />
            <circle cx="80" cy="30" r="4" className="fill-slate-600 hover:fill-[#ff623d] transition-colors" />
            <circle cx="30" cy="75" r="4" className="fill-slate-600 hover:fill-[#ff623d] transition-colors" />
            <circle cx="70" cy="75" r="4" className="fill-slate-600 hover:fill-[#ff623d] transition-colors" />
          </svg>
        </div>
      ),
    },
    {
      title: 'Scheduler Agent',
      desc: 'Sinkronisasi jadwal tim secara otomatis dan atur pertemuan tanpa konflik waktu.',
      icon: <Calendar className="w-6 h-6 text-[#ff623d]" />,
      visual: (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center p-4">
          {/* Calendar visual */}
          <div className="w-28 bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden text-[9px] font-sans">
            <div className="bg-red-500/20 border-b border-red-500/30 px-2 py-1 flex items-center justify-between text-red-400 font-bold">
              <span>JANUARI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-7 gap-1 p-2 text-slate-500 text-center font-mono">
              <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
              <span className="text-slate-700">28</span><span className="text-slate-700">29</span><span className="text-slate-700">30</span>
              <span className="text-slate-300 font-bold bg-[#ff623d]/20 text-[#ff623d] rounded-sm">1</span>
              <span className="text-slate-300">2</span><span className="text-slate-300">3</span><span className="text-slate-300">4</span>
              <span className="text-slate-300">5</span><span className="text-slate-300">6</span>
              <span className="text-slate-300 bg-slate-800 rounded-sm">7</span>
              <span className="text-slate-300">8</span><span className="text-slate-300">9</span><span className="text-slate-300">10</span><span className="text-slate-300">11</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Communication Agent',
      desc: 'Draft email, ringkasan chat Slack, dan korespondensi eksternal dalam sekejap.',
      icon: <Mail className="w-6 h-6 text-[#ff623d]" />,
      visual: (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center p-4">
          {/* Messaging Bubble Visual */}
          <div className="w-full max-w-[130px] space-y-2">
            <div className="flex items-start space-x-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-[7px] font-bold text-white">U</div>
              <div className="bg-slate-800 text-slate-300 p-1.5 rounded-r-lg rounded-bl-lg text-[8px] leading-tight">
                Draft email follow-up klien...
              </div>
            </div>
            <div className="flex items-start space-x-1.5 justify-end">
              <div className="bg-[#ff623d]/20 border border-[#ff623d]/30 text-[#ff623d] p-1.5 rounded-l-lg rounded-br-lg text-[8px] leading-tight max-w-[100px]">
                Subjek: Kelanjutan Project
                Halo Tim, Berikut draf...
              </div>
              <div className="w-4 h-4 rounded-full bg-[#ff623d] flex-shrink-0 flex items-center justify-center text-[7px] font-bold text-white">AI</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Task Agent',
      desc: 'Integrasi langsung ke Jira untuk membuat, mengedit, dan memantau tiket pekerjaan.',
      icon: <CheckSquare className="w-6 h-6 text-[#ff623d]" />,
      visual: (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center p-3">
          {/* Kanban / Workflow Card Visual */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-[150px]">
            <div className="bg-slate-900 border border-slate-800 p-1.5 rounded text-[8px] flex flex-col space-y-1">
              <span className="text-slate-500 font-bold text-[7px] uppercase tracking-wider">TO DO</span>
              <div className="bg-slate-800 p-1 rounded border border-slate-700 text-slate-300">
                KAN-47 Fix auth bug
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-1.5 rounded text-[8px] flex flex-col space-y-1">
              <span className="text-slate-500 font-bold text-[7px] uppercase tracking-wider">IN PROGRESS</span>
              <div className="bg-[#ff623d]/10 border border-[#ff623d]/30 p-1 rounded text-[#ff623d] flex items-center justify-between">
                <span>KAN-29 API Sync</span>
                <span className="w-1 h-1 rounded-full bg-[#ff623d] animate-ping" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Document Agent',
      desc: 'Ringkas dokumen panjang, analisis PDF, dan buat laporan draf otomatis.',
      icon: <FileText className="w-6 h-6 text-[#ff623d]" />,
      visual: (
        <div className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center p-3">
          {/* Document Summary layout */}
          <div className="w-28 bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[8px] font-bold text-slate-400">report_q2.pdf</span>
              <span className="text-[7px] text-green-500 font-bold bg-green-500/10 px-1 rounded">Parsed</span>
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-slate-800 rounded w-full" />
              <div className="h-1 bg-slate-800 rounded w-5/6" />
              <div className="h-1 bg-[#ff623d]/30 rounded w-4/6" />
            </div>
            <div className="bg-[#ff623d]/10 p-1 rounded border border-[#ff623d]/20 text-[7px] text-[#ff623d] leading-normal font-sans">
              Summary: Profit naik 14%, cost operasional turun 8% berkat otomasi AI.
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="home" className="w-full min-h-screen bg-white text-slate-800 font-sans flex flex-col selection:bg-[#ff623d]/30 selection:text-[#ff623d]">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff5f3f] to-[#e84322] flex items-center justify-center text-white shadow-[0_2px_10px_rgba(232,67,34,0.3)]">
              <Cpu className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight text-slate-900">
              AI Team Assistant
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-[#ff623d] transition-colors focus:outline-none"
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#ff623d] transition-colors focus:outline-none"
            >
              Fitur
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#ff623d] transition-colors focus:outline-none"
            >
              Cara Kerja
            </button>
          </nav>

          {/* Login / Register Button */}
          <div>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#ff623d] text-white hover:bg-[#e84322] shadow-[0_4px_12px_rgba(255,98,61,0.25)] hover:shadow-[0_6px_16px_rgba(255,98,61,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Masuk / Daftar
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-12 md:py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-[2.85rem] font-extrabold leading-[1.12] text-slate-900 tracking-tight">
                Satu Platform AI untuk{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f3f] to-[#e84322] drop-shadow-sm">
                  Seluruh Tim Anda
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Delegasikan tugas operasional, pantau progres Jira, kelola email &amp; jadwal — semua dari satu antarmuka berbasis AI yang terintegrasi secara cerdas.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold bg-[#ff623d] text-white hover:bg-[#e84322] shadow-[0_8px_20px_rgba(255,98,61,0.3)] hover:shadow-[0_12px_24px_rgba(255,98,61,0.4)] transition-all duration-300 hover:-translate-y-1"
                >
                  Daftar Gratis
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all duration-300 hover:border-slate-300 hover:-translate-y-1"
                >
                  Lihat Demo
                </button>
              </div>
            </div>

            {/* Hero Right Mockup */}
            <div className="lg:col-span-7 relative max-w-2xl mx-auto lg:max-w-none w-full">
              {/* Decorative backgrounds */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-red-100/30 rounded-full blur-2xl -z-10" />
              
              {/* Premium CSS Mockup Window */}
              <div className="relative rounded-2xl border border-slate-200 bg-[#f8f9fd] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden font-sans text-xs transition-transform duration-500 hover:scale-[1.01]">
                
                {/* Window Title Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="text-slate-400 font-semibold text-[10px] tracking-wider uppercase select-none">
                    AI Team Assistant — EXECUTIVE CANVAS
                  </div>
                  <div className="w-12" />
                </div>

                <div className="flex h-[320px] sm:h-[400px]">
                  
                  {/* Mock Sidebar */}
                  <div className="w-[120px] sm:w-[160px] bg-[#111111] text-slate-400 flex flex-col p-3 border-r border-slate-800">
                    <div className="flex items-center space-x-2 mb-5 px-1.5">
                      <div className="w-4 h-4 rounded bg-[#ff623d] flex items-center justify-center text-white text-[8px] font-bold">A</div>
                      <span className="font-bold text-white text-[9px] sm:text-xs">AI Team Assistant</span>
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-md text-[10px] sm:text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Dashboard</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-md text-[10px] sm:text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Supervisor</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-md text-[10px] sm:text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Documents</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-md text-[10px] sm:text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Calendar</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-md text-[10px] sm:text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Email</span>
                      </div>
                      <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-slate-800 text-[#ff623d] rounded-lg text-[10px] sm:text-xs font-semibold shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff623d]" />
                        <span>Jira Workspace</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="flex-1 p-3 sm:p-5 flex flex-col space-y-3.5 overflow-y-auto">
                    
                    {/* Header */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-[11px] sm:text-sm">Jira Workspace</h4>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Kelola dan pantau semua issue Jira Anda dalam satu tempat.</p>
                      </div>
                      <div className="px-2.5 py-1.5 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg text-[9px] flex items-center space-x-1.5">
                        <span>Cari issue atau project...</span>
                        <span className="text-[8px] bg-slate-200 px-1 rounded text-slate-500 font-mono">Ctrl K</span>
                      </div>
                    </div>

                    {/* Progress & Stat Row */}
                    <div className="grid grid-cols-12 gap-3">
                      
                      {/* Radial Progress Card */}
                      <div className="col-span-6 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                            <circle cx="24" cy="24" r="20" stroke="#ff5f3f" strokeWidth="4.5" fill="transparent"
                              strokeDasharray={2 * Math.PI * 20}
                              strokeDashoffset={2 * Math.PI * 20 * (1 - 0.24)} />
                          </svg>
                          <span className="absolute font-bold text-slate-800 text-[10px]">24%</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-700 text-[10px] sm:text-xs">Progress Issue</h5>
                          <p className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">3 Completed / 11 in Progress dari 33 issues</p>
                        </div>
                      </div>

                      {/* Stat Card 1 */}
                      <div className="col-span-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                        <span className="text-lg sm:text-xl font-bold text-slate-800">33</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">Total Issue</span>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="col-span-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                        <span className="text-lg sm:text-xl font-bold text-red-500">3</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">Unassigned</span>
                      </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-slate-700 text-[10px] sm:text-xs flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff623d] animate-pulse" />
                          <span>AI Insights</span>
                        </h5>
                        <span className="text-[8px] bg-red-50 text-[#ff623d] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-normal">
                        Klik tombol refresh untuk test hit AI. AI mendeteksi bottleneck di progress KAN-47. Disarankan menugaskan Task Agent untuk investigasi.
                      </p>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Stat Bar Section */}
      <section className="bg-gradient-to-r from-[#ff5f3f] to-[#e84322] py-8 text-white relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 border-r border-white/20 last:border-r-0">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">7</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">AI Agents Aktif</div>
            </div>
            <div className="space-y-1 border-r border-white/20 last:border-r-0">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">85+</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">Workflow Nodes</div>
            </div>
            <div className="space-y-1 border-r border-white/20 last:border-r-0">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">&lt; 5 Detik</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">Respons</div>
            </div>
            <div className="space-y-1">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">FREE</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">Untuk Tim Jalin</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Masalah (Problems) Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-[#ff623d] uppercase tracking-widest bg-red-100/50 px-3 py-1 rounded-full">
              MASALAH
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 max-w-2xl mx-auto leading-tight">
              Tim Anda sudah pakai AI — <span className="text-[#ff623d]">tapi masih terpisah-pisah.</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
              Agen-agen belum maksimal karena workflow yang tidak terhubung secara integratif.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Visual Chip (Left) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-3xl bg-[#111111] p-6 border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,98,61,0.12)_0%,transparent_65%)]" />
                
                {/* Board grid patterns */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Corner light markers */}
                <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-red-500/50" />

                {/* Chip Center */}
                <div className="m-auto relative w-24 h-24 bg-gradient-to-br from-[#222] to-[#111] border-2 border-slate-700/60 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(232,67,34,0.2)] group-hover:border-[#ff623d]/50 transition-all duration-500">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#ff5f3f] to-[#e84322] rounded-2xl opacity-10 blur group-hover:opacity-30 transition-opacity" />
                  
                  {/* Pins around the chip */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    <div className="w-1.5 h-3 bg-slate-700/60 rounded-b-sm" />
                    <div className="w-1.5 h-3 bg-[#ff623d] rounded-b-sm" />
                    <div className="w-1.5 h-3 bg-slate-700/60 rounded-b-sm" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    <div className="w-1.5 h-3 bg-slate-700/60 rounded-t-sm" />
                    <div className="w-1.5 h-3 bg-[#ff623d] rounded-t-sm" />
                    <div className="w-1.5 h-3 bg-slate-700/60 rounded-t-sm" />
                  </div>
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col space-y-1.5">
                    <div className="h-1.5 w-3 bg-slate-700/60 rounded-r-sm" />
                    <div className="h-1.5 w-3 bg-[#ff623d] rounded-r-sm" />
                    <div className="h-1.5 w-3 bg-slate-700/60 rounded-r-sm" />
                  </div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col space-y-1.5">
                    <div className="h-1.5 w-3 bg-slate-700/60 rounded-l-sm" />
                    <div className="h-1.5 w-3 bg-[#ff623d] rounded-l-sm" />
                    <div className="h-1.5 w-3 bg-slate-700/60 rounded-l-sm" />
                  </div>

                  <span className="font-headline font-black text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    AI
                  </span>
                </div>

                <div className="text-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                  Engine Orchestrator
                </div>
              </div>
            </div>

            {/* Negative Points (Right) */}
            <div className="lg:col-span-7 space-y-4">
              {[
                'Buka ChatGPT di satu tab, Jira di tab lain, Gmail di tab lain.',
                'Tidak ada monitoring biaya AI yang terpusat di seluruh tim.',
                'Setiap tim integrasi AI dari nol, berulang-ulang, menghabiskan waktu.',
                'Penting untuk mengembangkan kerangka kerja yang dapat digunakan kembali untuk mempercepat proses integrasi.',
                'Kolaborasi lintas fungsi meningkatkan inovasi dan mengurangi waktu pengembangan AI secara keseluruhan.',
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-[#ff623d] to-[#e84322] text-white shadow-md transform hover:-translate-x-1 transition-transform duration-300"
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[#ff623d]">
                    <X className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-semibold leading-snug">{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. Fitur-Fitur (Features) Section */}
      <section id="features" className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-[#ff623d] uppercase tracking-widest bg-red-100/50 px-3 py-1 rounded-full">
              FITUR-FITUR
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Yang bisa dilakukan AI Assistant ini.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
              Agen-agen khusus untuk efisiensi maksimal bagi seluruh divisi kerja.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div
                key={i}
                className="group flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Visual Area */}
                <div className="h-44 w-full bg-[#111111] overflow-hidden border-b border-slate-100 relative">
                  {feat.visual}
                </div>
                
                {/* Content Area */}
                <div className="p-6 flex-1 flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-orange-50 border border-orange-100/50">
                      {feat.icon}
                    </div>
                    <h3 className="font-headline font-bold text-lg text-slate-950">
                      {feat.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Cara Kerja (How It Works) Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold text-[#ff623d] uppercase tracking-widest bg-red-100/50 px-3 py-1 rounded-full">
              FITUR-FITUR
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Cara Kerja
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
              Tiga langkah mudah menuju produktivitas AI yang optimal.
            </p>
          </div>

          {/* Step Sequence Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm text-center space-y-4 relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-blue-50/50 border-2 border-blue-500/20 text-blue-600 flex items-center justify-center font-headline font-black text-xl shadow-inner">
                1
              </div>
              <h3 className="font-headline font-bold text-lg text-slate-900">
                Login dengan Google
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gunakan akun Jalin Anda untuk akses cepat dan aman ke workspace terpusat.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm text-center space-y-4 relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-rose-50/50 border-2 border-rose-500/20 text-rose-600 flex items-center justify-center font-headline font-black text-xl shadow-inner">
                2
              </div>
              <h3 className="font-headline font-bold text-lg text-slate-900">
                Ketik instruksi di chat
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Berikan perintah dalam bahasa alami layaknya berbicara langsung kepada asisten pribadi Anda.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm text-center space-y-4 relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50/50 border-2 border-emerald-500/20 text-emerald-600 flex items-center justify-center font-headline font-black text-xl shadow-inner">
                3
              </div>
              <h3 className="font-headline font-bold text-lg text-slate-900">
                Dapatkan hasil instan
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                AI mengeksekusi tugas di Jira, Gmail, atau Google Calendar secara langsung dalam hitungan detik.
              </p>
            </div>

          </div>

          {/* Connection Status Ribbon */}
          <div className="mt-16 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 text-xs font-bold text-slate-700 tracking-wider">
              <span className="text-[#ff623d] uppercase">YANG SUDAH TERHUBUNG:</span>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#ff623d]" />
                <span>143 EKSEKUSI AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#ff623d]" />
                <span>2M+ TOKEN DIPROSES</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#ff623d]" />
                <span>7 AGEN AKTIF</span>
              </div>
              <div className="flex items-center space-x-2 text-[#ff623d]">
                <span className="w-2 h-2 rounded-full bg-[#ff623d]" />
                <span>GOOGLE WORKSPACE + JIRA</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Call to Action (CTA) Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#e84322] to-[#c73415] rounded-[2.5rem] shadow-xl overflow-hidden p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 z-10 text-center lg:text-left">
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold leading-tight">
                Mulai sentralisasi AI tim Anda hari ini. <span className="italic">Gratis.</span>
              </h2>
              <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Daftar &lt;40 detik. Login dengan Google, hubungkan Jira, dan mulai delegasikan tugas operasional ke agen AI cerdas kami.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold bg-white text-[#e84322] hover:bg-slate-50 shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Daftar Sekarang
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold border border-white/30 bg-transparent text-white hover:bg-white/10 transition-colors duration-300"
                >
                  Lihat Demo
                </button>
              </div>
            </div>

            {/* Right Graphic/Console */}
            <div className="lg:col-span-5 z-10 flex justify-center w-full">
              <div className="w-full max-w-[360px] aspect-video bg-[#111111] rounded-2xl border border-white/10 p-4 font-mono text-[9px] text-[#ff623d] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-2 right-4 flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
                
                <div className="space-y-1">
                  <div className="text-slate-500">&gt; orchestrator.status()</div>
                  <div className="text-slate-300">Checking connection to Google Workspace... OK</div>
                  <div className="text-slate-300">Syncing Jira API status... Connected</div>
                  <div className="text-green-500 flex items-center space-x-1.5">
                    <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                    <span>System active: 7 agent(s) ready</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-slate-500 text-[8px]">
                  <span>Jalin_Team_Assistant_OS</span>
                  <span>v1.0.0</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer className="bg-slate-50 border-t border-slate-200/80 pt-16 pb-8 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-slate-200">
            
            {/* Column 1: Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#ff5f3f] to-[#e84322] flex items-center justify-center text-white">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="font-headline font-bold text-base text-slate-900">
                  AI Team Assistant
                </span>
              </div>
              <p className="max-w-sm text-slate-500 leading-relaxed text-xs">
                Platform orkestrasi AI terpadu yang memberdayakan tim di PT. Jalin Mayantara Indonesia untuk mencapai efisiensi operasional tertinggi.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-headline font-bold text-slate-900 text-xs uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#ff623d] transition-colors">
                    Fitur
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-[#ff623d] transition-colors">
                    Integrasi
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ff623d] transition-colors">
                    Dokumentasi
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Bantuan Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-headline font-bold text-slate-900 text-xs uppercase tracking-wider">
                Bantuan
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-[#ff623d] transition-colors">
                    Kontak Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ff623d] transition-colors">
                    Pusat Bantuan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ff623d] transition-colors">
                    Feedback
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Hukum Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-headline font-bold text-slate-900 text-xs uppercase tracking-wider">
                Hukum
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-[#ff623d] transition-colors">
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#ff623d] transition-colors">
                    Syarat &amp; Ketentuan
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <span>© 2026 PT. Jalin Mayantara Indonesia. All rights reserved.</span>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-5 text-slate-400">
              <a href="#" className="hover:text-[#ff623d] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-[#ff623d] transition-colors">
                <HelpCircle className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-[#ff623d] transition-colors">
                <Users className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
