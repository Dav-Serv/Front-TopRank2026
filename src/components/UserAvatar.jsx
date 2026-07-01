import { useState } from 'react';

/**
 * Reusable avatar component.
 * Shows photo if available, falls back to initials.
 *
 * Props:
 *   name      — user's display name (for initials fallback)
 *   avatarUrl — photo URL (local upload or Google OAuth URL)
 *   size      — diameter in px (default 40)
 *   fontSize  — override initials font size
 */
export default function UserAvatar({ name, avatarUrl, size = 40, fontSize }) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Normalise Google photo URL to a reliable size
  const resolvedUrl = avatarUrl?.includes('googleusercontent.com')
    ? avatarUrl.replace(/=s\d+-c$/, '=s96-c')
    : avatarUrl;

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt={name || 'avatar'}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
          border: '2px solid var(--border)',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: fontSize ?? size * 0.35 }}
    >
      {initials}
    </div>
  );
}
