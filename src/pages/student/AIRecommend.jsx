import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// ── tiny markdown-like formatter ─────────────────────────────────────────
function FormattedText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.8, fontSize: '0.9rem' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        if (/^\*\*(.+)\*\*$/.test(line)) {
          return <p key={i} style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{line.replace(/\*\*/g, '')}</p>;
        }
        if (/^[*-] /.test(line)) {
          return <li key={i} style={{ marginLeft: '1.25rem', marginBottom: '0.2rem' }}>{line.replace(/^[*-] /, '')}</li>;
        }
        if (/^\d+\. /.test(line)) {
          return <li key={i} style={{ marginLeft: '1.25rem', marginBottom: '0.2rem', listStyleType: 'decimal' }}>{line.replace(/^\d+\. /, '')}</li>;
        }
        return <p key={i} style={{ marginBottom: '0.35rem' }}>{line}</p>;
      })}
    </div>
  );
}

// ── priority badge ────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    high:   { label: 'Prioritas Tinggi', bg: 'rgba(217,45,32,0.1)',   color: 'var(--danger)' },
    medium: { label: 'Disarankan',       bg: 'rgba(255,172,0,0.15)',  color: '#8a4000' },
    low:    { label: 'Opsional',         bg: 'rgba(22,138,90,0.1)',   color: 'var(--success)' },
  };
  const style = map[priority] || map.medium;
  return (
    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
}

// ── section card ──────────────────────────────────────────────────────────
function SectionCard({ icon, title, children, accent }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${accent || 'var(--primary)'}`,
      borderRadius: 10,
      padding: '1.25rem 1.375rem',
    }}>
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────
export default function AIRecommend() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [fetched, setFetched] = useState(false);

  const fetch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/recommend');
      setData(res.data.data);
      setFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendapatkan rekomendasi. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const sections = data?.sections;
  const isRaw    = sections?.raw;   // fallback when JSON parse fails

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>🤖 AI Rekomendasi</h1>
          <p>Saran karir personal berbasis data profil Anda</p>
        </div>
        {data && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(112,0,112,0.1)',
            color: 'var(--primary)',
          }}>
            🔍 Analisis Berbasis Data
          </span>
        )}
      </div>

      <div className="page-body">
        {/* Hero / trigger */}
        {!fetched && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="card p-8" style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(112,0,112,0.06) 0%, rgba(255,204,0,0.1) 100%)',
              border: '1px solid rgba(112,0,112,0.12)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: 1 }}>🤖</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>AI Personal Mentor</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 1.75rem' }}>
                AI akan menganalisis profil, skill, sertifikat, dan portfolio Anda, lalu memberikan rekomendasi yang spesifik untuk mengembangkan karir Anda.
              </p>

              {/* Profile completeness hint */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Profil', filled: !!user?.name },
                  { label: 'Skill', filled: false },
                  { label: 'Sertifikat', filled: false },
                  { label: 'Portfolio', filled: false },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', margin: '0 auto 0.3rem',
                      background: item.filled ? 'rgba(22,138,90,0.15)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                    }}>
                      {item.filled ? '✅' : '○'}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-lg" onClick={fetch} disabled={loading} style={{ gap: '0.75rem' }}>
                {loading ? <><div className="spinner" /> Menganalisis...</> : '✨ Analisis Profil Saya'}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="card p-8" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 1.25rem' }}>
                <div className="spinner spinner-dark" style={{ width: 64, height: 64, borderWidth: 4, position: 'absolute', inset: 0 }} />
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🤖</span>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sedang menganalisis profil Anda...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI sedang membaca skill, sertifikat, dan portfolio Anda</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ maxWidth: 680, margin: '0 auto' }}>⚠️ {error}</div>
        )}

        {/* Result */}
        {sections && !loading && (
          <div style={{ maxWidth: 860, margin: '0 auto' }} className="fade-in">

            {/* Raw fallback */}
            {isRaw ? (
              <div className="card p-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🤖</div>
                  <div>
                    <h3 style={{ fontWeight: 700 }}>Rekomendasi untuk {user?.name?.split(' ')[0]}</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.aiPowered ? 'Powered by Gemini AI' : 'Keyword Matching'}</p>
                  </div>
                </div>
                <div style={{ background: '#faf7fb', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <FormattedText text={sections.raw} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Summary banner */}
                {sections.summary && (
                  <div style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: '#ffffff', borderRadius: 12, padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  }}>
                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Halo, {user?.name?.split(' ')[0]}!</p>
                      <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>{sections.summary}</p>
                    </div>
                    {/* Rank badge */}
                    {sections.stats?.rank && (
                      <div style={{
                        textAlign: 'center', background: 'rgba(255,255,255,0.15)',
                        borderRadius: 10, padding: '0.625rem 1rem', flexShrink: 0,
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>#{sections.stats.rank}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '0.2rem' }}>Peringkat</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Top {sections.stats.topPercent}%</div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Strengths */}
                  {sections.strengths?.length > 0 && (
                    <SectionCard icon="💪" title="Kekuatan Anda" accent="var(--success)">
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sections.strengths.map((s, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  )}

                  {/* Next Skills */}
                  {sections.nextSkills?.length > 0 && (
                    <SectionCard icon="📚" title="Skill Selanjutnya yang Perlu Dipelajari" accent="var(--primary-dark)">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                        {sections.nextSkills.map((s, i) => (
                          <span key={i} style={{
                            fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.75rem',
                            borderRadius: '9999px', background: 'rgba(74,27,157,0.08)', color: 'var(--primary-dark)',
                            border: '1px solid rgba(74,27,157,0.15)',
                          }}>
                            + {s}
                          </span>
                        ))}
                      </div>
                      <Link to="/skills" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                        ⚡ Tambah Skill →
                      </Link>
                    </SectionCard>
                  )}
                </div>

                {/* Cert suggestions */}
                {sections.certSuggestions?.length > 0 && (
                  <SectionCard icon="📜" title="Sertifikasi yang Direkomendasikan" accent="var(--accent)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {sections.certSuggestions.map((cert, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.625rem 0.875rem', background: '#faf7fb',
                          borderRadius: 8, border: '1px solid var(--border)',
                        }}>
                          <span style={{ fontSize: '1.1rem' }}>🎓</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{cert}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/certificates" className="btn btn-secondary btn-sm" style={{ marginTop: '0.875rem', textDecoration: 'none', display: 'inline-flex' }}>
                      📜 Upload Sertifikat →
                    </Link>
                  </SectionCard>
                )}

                {/* Improvements */}
                {sections.improvements?.length > 0 && (
                  <SectionCard icon="🎯" title="Yang Perlu Ditingkatkan" accent="var(--accent)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {sections.improvements.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                          padding: '0.875rem', background: '#faf7fb', borderRadius: 8,
                          border: '1px solid var(--border)',
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(255,172,0,0.15)', color: '#8a4000',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 800,
                          }}>{i + 1}</div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{item.area}</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Opportunities */}
                {sections.opportunities?.length > 0 && (
                  <SectionCard icon="🚀" title="Peluang yang Cocok untuk Anda" accent="var(--secondary)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {sections.opportunities.map((opp, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          gap: '1rem', padding: '0.875rem',
                          background: '#faf7fb', borderRadius: 8, border: '1px solid var(--border)',
                        }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{opp.title}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{opp.reason}</p>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            <PriorityBadge priority={opp.priority} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Motivation */}
                {sections.motivation && (
                  <div style={{
                    background: 'rgba(255,204,0,0.12)',
                    border: '1px solid rgba(255,172,0,0.3)',
                    borderRadius: 10, padding: '1.125rem 1.375rem',
                    display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic', color: '#5a3a00', fontWeight: 500 }}>
                      {sections.motivation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Refresh button */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={fetch} disabled={loading}>
                🔄 Perbarui Rekomendasi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
