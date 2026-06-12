import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  CheckSquare,
  FileText,
  Globe,
  HelpCircle,
  Mail,
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
      title: 'Dashboard Workspace',
      desc: 'Lihat briefing harian, agenda terdekat, progres pekerjaan, dan rekomendasi prioritas dari seluruh workspace dalam satu command center.',
      icon: <Activity className="w-6 h-6 text-[#ff623d]" />,
      agent: 'Supervisor Agent',
      image: '/feature/aidashboard.png',
      span: 'lg:col-span-2',
    },
    {
      title: 'Email Workspace',
      desc: 'Kelola inbox, baca email prioritas, dapatkan insight, buat draft balasan, dan lanjutkan korespondensi tanpa berpindah aplikasi.',
      icon: <Mail className="w-6 h-6 text-[#ff623d]" />,
      agent: 'Communication Agent',
      image: '/feature/aiemail.png',
      span: 'lg:col-span-2',
    },
    {
      title: 'Task Progress Workspace',
      desc: 'Pantau issue Jira dalam board To Do, In Progress, dan Done, lalu lihat blocker, overdue, serta rekomendasi tindakan berikutnya.',
      icon: <CheckSquare className="w-6 h-6 text-[#ff623d]" />,
      agent: 'Task Agent',
      image: '/feature/aijira.png',
      span: 'lg:col-span-2',
    },
    {
      title: 'Document Workspace',
      desc: 'Upload dan kelola PDF atau DOCX, lalu tanyakan isi dokumen dengan pencarian konteks berbasis vector dan RAG.',
      icon: <FileText className="w-6 h-6 text-[#ff623d]" />,
      agent: 'Knowledge Agent · RAG',
      image: '/feature/aidocument.png',
      span: 'lg:col-span-3',
    },
    {
      title: 'Calendar Workspace',
      desc: 'Kelola agenda Google Calendar, lihat potensi konflik, buat meeting baru, dan siapkan tindak lanjut berdasarkan konteks event.',
      icon: <Calendar className="w-6 h-6 text-[#ff623d]" />,
      agent: 'Scheduler Agent',
      image: '/feature/aicalendar.png',
      span: 'lg:col-span-3',
    },
  ];

  return (
    <div id="home" className="w-full min-h-screen bg-white text-slate-800 font-sans flex flex-col selection:bg-[#ff623d]/30 selection:text-[#ff623d]">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="AI Team Assistant" className="w-8 h-8" />
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
      <section className="relative py-8 md:py-10 lg:h-[calc(100vh-9.875rem)] lg:min-h-[520px] lg:py-12 overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 lg:gap-6 items-center lg:h-full">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-4 space-y-5 text-center lg:text-left">
              <h1 className="font-headline text-xl sm:text-5xl lg:text-5xl font-extrabold leading-[1.08] text-slate-900 tracking-tight">
                Command Center AI untuk{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f3f] to-[#e84322] drop-shadow-sm">
                  Kerja Tim Harian
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Satukan briefing harian, email, kalender, Jira, dan dokumen dalam satu workspace. Delegasikan tugas lintas domain ke AI Workspace Assistant tanpa berpindah alat.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold bg-[#ff623d] text-white hover:bg-[#e84322] shadow-[0_8px_20px_rgba(255,98,61,0.3)] hover:shadow-[0_12px_24px_rgba(255,98,61,0.4)] transition-all duration-300 hover:-translate-y-1"
                >
                  Mulai Gratis
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all duration-300 hover:border-slate-300 hover:-translate-y-1"
                >
                  Lihat Fitur
                </button>
              </div>
            </div>

            {/* Hero Right - Dashboard Screenshot */}
            <div className="lg:col-span-8 relative w-full max-w-[1040px] h-[340px] sm:h-[440px] lg:h-[58vh] mx-auto lg:mr-[-48px] xl:mr-[-88px] overflow-hidden">
              <img
                src="/dashboard.png"
                alt="AI Team Assistant Dashboard"
                className="border h-full w-full object-cover object-left-top scale-[1.12]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stat Bar Section */}
      <section className="bg-gradient-to-r from-[#ff5f3f] to-[#e84322] py-5 text-white relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 border-r border-white/20 last:border-r-0">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">1</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">Command Center</div>
              <div className="text-[11px] sm:text-xs text-white/65 font-medium">Email, Kalender, Jira, Dokumen</div>
            </div>
            <div className="space-y-1 border-r border-white/20 last:border-r-0">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">24/7</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">AI Assistant</div>
              <div className="text-[11px] sm:text-xs text-white/65 font-medium">Siap bantu delegasi kerja</div>
            </div>
            <div className="space-y-1 border-r border-white/20 last:border-r-0">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">5</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">Workspace Utama</div>
              <div className="text-[11px] sm:text-xs text-white/65 font-medium">Dashboard, Email, Calendar, Project, Document</div>
            </div>
            <div className="space-y-1">
              <div className="font-headline text-3xl sm:text-4xl font-extrabold">FREE</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium">Untuk Tim Jalin</div>
              <div className="text-[11px] sm:text-xs text-white/65 font-medium">Akses awal tanpa biaya</div>
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
            
            {/* Visual (Left) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-square rounded-3xl bg-transparent flex items-center justify-center">
                <img src="/feature/aiagent.png" alt="AI Agents" className="w-full h-full object-contain drop-shadow-2xl" />
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
              Lima workspace untuk kerja tim sehari-hari.
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
              Kelola briefing, email, task progress, dokumen, dan kalender dari satu tempat, dengan agent khusus pada setiap alur kerja.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] ${feat.span}`}
              >
                {/* Visual Area */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-slate-100 bg-slate-50">
                  <img
                    src={feat.image}
                    alt={`Ilustrasi ${feat.title}`}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.025]"
                    loading="lazy"
                  />
                  <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#e84322] shadow-sm backdrop-blur">
                    {feat.agent}
                  </div>
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
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src="/logo.png" alt="AI Team Assistant" className="w-6 h-6" />
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
