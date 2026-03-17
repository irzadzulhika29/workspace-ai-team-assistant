import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function DashboardCard({ to, icon: Icon, title, desc, tone, accent: Accent }) {
  return (
    <Link
      to={to}
      className="
        group relative flex flex-col gap-4 p-5 rounded-2xl border border-slate-200 bg-white
        hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md
        transition-all duration-200 overflow-hidden
      "
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${tone}`}>
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-auto">
        <span>Buka workspace</span>
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
      </div>

      <Accent
        size={44}
        className="absolute -bottom-2 -right-2 opacity-[0.08] text-slate-700"
      />
    </Link>
  )
}
