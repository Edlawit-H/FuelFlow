import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';
import { useLang, LANGUAGES } from '../context/LanguageContext';

/* All text uses inline style so global CSS cannot override colors */

export default function FuelFlowLanding() {
  const { t, lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>

      {/* ── Navbar ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 80px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', textDecoration: 'none' }}>{t.appName}</Link>

        <div style={{ display: 'flex', gap: '32px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
          <a href="#solutions" style={{ color: '#64748b', textDecoration: 'none' }}>{t.solutions}</a>
          <a href="#how-it-works" style={{ color: '#64748b', textDecoration: 'none' }}>{t.howItWorks}</a>
          <a href="#benefits" style={{ color: '#64748b', textDecoration: 'none' }}>{t.benefits}</a>
          <a href="#user-types" style={{ color: '#64748b', textDecoration: 'none' }}>{t.userTypes}</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Switcher */}
          <div style={{ position: 'relative' }} ref={langRef}>
            <button
              onClick={() => setLangOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '2px solid #5eead4', background: '#f0fdfa', color: '#0f766e', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              <Globe size={15} />
              <span>{LANGUAGES[lang].name}</span>
              <ChevronDown size={13} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: '180px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                {Object.values(LANGUAGES).map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: lang === l.code ? '#f0fdfa' : '#fff', color: lang === l.code ? '#0f766e' : '#334155', fontWeight: lang === l.code ? '700' : '400', fontSize: '14px', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span>{l.name}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/login" style={{ background: '#14b8a6', color: '#fff', padding: '9px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>{t.login}</Link>
          <Link to="/signup" style={{ background: '#10b981', color: '#fff', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>{t.signUp}</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={{ padding: '80px 24px 96px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '999px', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', color: '#94a3b8' }}>Fuel Management System</span>
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '800', color: '#0f172a', margin: '0 0 24px', letterSpacing: '-1px' }}>{t.appName}</h1>
        <p style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px' }}>{t.heroSubtitle}</p>
        <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7' }}>{t.heroDesc}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ background: '#14b8a6', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>{t.login}</Link>
          <Link to="/signup" style={{ background: '#10b981', color: '#fff', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>{t.signUp}</Link>
        </div>
      </header>

      {/* ── How it Works ── */}
      <section id="how-it-works" style={{ padding: '80px 80px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#0f172a', margin: '0 0 64px' }}>{t.howItWorks}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { id: 1, title: t.step1Title, desc: t.step1Desc },
            { id: 2, title: t.step2Title, desc: t.step2Desc },
            { id: 3, title: t.step3Title, desc: t.step3Desc },
          ].map(item => (
            <div key={item.id} style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#14b8a6', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginBottom: '24px' }}>{item.id}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── System Overview ── */}
      <section id="solutions" style={{ padding: '96px 80px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '64px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 40px' }}>{t.overviewTitle}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                { label: t.feat1Label, text: t.feat1Text },
                { label: t.feat2Label, text: t.feat2Text },
                { label: t.feat3Label, text: t.feat3Text },
                { label: t.feat4Label, text: t.feat4Text },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', marginTop: '8px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>{f.label}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Live queue mockup */}
          <div style={{ flex: '1 1 360px', background: '#e2e8f0', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
            <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Live Queue: Station #942</span>
                <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>ACTIVE</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[['4421', 'Next in line', true], ['4422', 'Waiting', false], ['4423', 'Waiting', false]].map(([pin, status, active]) => (
                  <div key={pin} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: active ? '600' : '400', color: active ? '#334155' : '#94a3b8' }}>PIN: {pin}</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: active ? '#10b981' : '#cbd5e1', textTransform: 'uppercase' }}>{status}</span>
                  </div>
                ))}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
                    <span>Petrol Supply</span><span>82%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: '6px', borderRadius: '999px' }}>
                    <div style={{ background: '#14b8a6', height: '100%', width: '82%', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Designed for Everyone ── */}
      <section id="user-types" style={{ padding: '96px 80px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#0f172a', margin: '0 0 64px' }}>{t.designedTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { badge: t.forDrivers, title: t.driverAccountTitle, features: [t.driverFeature1, t.driverFeature2, t.driverFeature3] },
            { badge: t.forStations, title: t.adminAccountTitle, features: [t.adminFeature1, t.adminFeature2, t.adminFeature3] },
          ].map((card, i) => (
            <div key={i} style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'inline-block', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>{card.badge}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px' }}>{card.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {card.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                    <span style={{ color: '#34d399', marginRight: '12px', fontSize: '18px' }}>•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why FuelFlow ── */}
      <section id="benefits" style={{ padding: '80px 80px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#0f172a', margin: '0 0 64px' }}>{t.whyTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { title: t.why1Title, desc: t.why1Desc },
            { title: t.why2Title, desc: t.why2Desc },
            { title: t.why3Title, desc: t.why3Desc },
            { title: t.why4Title, desc: t.why4Desc },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>{item.title}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 40px 80px' }}>
        <div style={{ background: '#064e3b', borderRadius: '40px', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 24px' }}>{t.ctaTitle}</h2>
          <p style={{ fontSize: '15px', color: 'rgba(209,250,229,0.8)', maxWidth: '500px', margin: '0 auto 40px', lineHeight: '1.7' }}>{t.ctaDesc}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ background: '#fff', color: '#064e3b', padding: '12px 40px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>{t.login}</Link>
            <Link to="/signup" style={{ background: '#2dd4bf', color: '#fff', padding: '12px 40px', borderRadius: '6px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}>{t.signUp}</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 80px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ fontWeight: '700', color: '#10b981', fontSize: '18px', marginBottom: '4px' }}>{t.appName}</div>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{t.footerCopy}</p>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '11px', fontWeight: '500' }}>
          {[t.privacyPolicy, t.termsOfService, t.contact, t.support].map(label => (
            <a key={label} href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
