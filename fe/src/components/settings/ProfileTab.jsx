import { User, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

const primaryButtonClassName =
  'rounded-2xl bg-[#ff623d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#ff744f]';
const outlineButtonClassName =
  'rounded-2xl border border-[#ff623d] px-4 py-2 text-sm font-medium text-[#ff623d] transition-colors hover:bg-[#fff4ef]';
const textButtonClassName =
  'rounded-2xl px-4 py-2 text-sm font-medium text-[#ff623d] transition-colors hover:bg-[#fff4ef] hover:text-[#ff744f]';

const getInitials = (value) =>
  String(value || 'AI')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function ProfileTab({
  profileForm,
  isProfileEditing,
  onProfileChange,
  onProfileSave,
  onProfileReset,
  onEditToggle
}) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and preferences
          </p>
        </div>
        <button
          onClick={onEditToggle}
          className={textButtonClassName}
        >
          {isProfileEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
            <Avatar className="h-28 w-28 overflow-hidden rounded-full border-8 border-white bg-slate-100 shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
              {user?.picture ? (
                <AvatarImage
                  src={user.picture}
                  alt={profileForm.name || 'User'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : null}
              <AvatarFallback className="h-full w-full rounded-full bg-[#fff4ef] text-2xl font-semibold text-[#ff623d]">
                {getInitials(profileForm.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="text-lg font-semibold text-slate-900">
                {profileForm.name || 'Workspace User'}
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              Full Name
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => onProfileChange('name', e.target.value)}
              disabled={!isProfileEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              Email Address
            </label>
            <input
              type="email"
              value={profileForm.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="your.email@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>


          {/* Action Buttons */}
          {isProfileEditing && (
            <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
              <button
                onClick={onProfileSave}
                className={primaryButtonClassName}
              >
                Save Changes
              </button>
              <button
                onClick={onProfileReset}
                className={outlineButtonClassName}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
