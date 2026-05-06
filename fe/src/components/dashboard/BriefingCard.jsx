import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPriorityColor,
  getDomainIcon,
  getDomainLabel,
  getDomainRoute,
  formatLastUpdated
} from '../../services/briefingService';

/**
 * BriefingCard - Komponen card untuk menampilkan AI briefing summary
 * @param {Object} props
 * @param {Object} props.briefing - Data briefing dari API
 * @param {string} props.domain - Domain briefing (jira, calendar, email)
 */
const BriefingCard = ({ briefing, domain }) => {
  const navigate = useNavigate();

  // Empty state - belum ada briefing
  if (!briefing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{getDomainIcon(domain)}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {getDomainLabel(domain)}
            </h3>
          </div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Briefing belum tersedia</p>
          <p className="text-sm text-gray-400">
            Muat ulang halaman atau klik refresh briefing
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (briefing.status === 'failed') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">{getDomainIcon(domain)}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {getDomainLabel(domain)}
            </h3>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 border border-red-200">
              Gagal
            </span>
          </div>
        </div>
        
        <div className="text-center py-6">
          <p className="text-gray-600 mb-2">Gagal mengambil briefing</p>
          <p className="text-sm text-gray-400">
            Terakhir dicoba: {formatLastUpdated(briefing.generated_at)}
          </p>
          {briefing.error_message && (
            <p className="text-xs text-red-600 mt-2">{briefing.error_message}</p>
          )}
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{getDomainIcon(domain)}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {getDomainLabel(domain)}
          </h3>
          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(briefing.priority)}`}>
            {briefing.priority === 'high' ? 'Prioritas Tinggi' : 
             briefing.priority === 'medium' ? 'Prioritas Sedang' : 
             'Prioritas Rendah'}
          </span>
        </div>
      </div>

      {/* Headline */}
      <div className="mb-4">
        <p className="text-gray-800 font-medium leading-relaxed">
          {briefing.headline}
        </p>
      </div>

      {/* Summary Points */}
      {briefing.summary_points && briefing.summary_points.length > 0 && (
        <ul className="space-y-2 mb-4">
          {briefing.summary_points.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-blue-500 mt-1">•</span>
              <span className="flex-1">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Partial status warning */}
      {briefing.status === 'partial' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            ⚠️ Beberapa data tidak tersedia
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <p>Update: {formatLastUpdated(briefing.generated_at)}</p>
        </div>
        
        <button
          onClick={() => navigate(getDomainRoute(domain))}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          Lihat detail →
        </button>
      </div>
    </div>
  );
};

export default BriefingCard;
