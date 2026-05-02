import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';
import { useLang, LANGUAGES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function FuelFlowLanding() {
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = useRef(null);

  // Redirect logged-in users
  useEffect(() => {
    if (user) {
      navigate(user.role === 'station_admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const close = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-8 lg:px-20 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold text-emerald-500 shrink-0">{t.appName}</Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
          <a href="#solutions" className="hover:text-emerald-500 transition">{t.solutions}</a>
          <a href="#how-it-works" className="hover:text-emerald-500 transition">{t.howItWorks}</a>
          <a href="#benefits" className="hover:text-emerald-500 transition">{t.benefits}</a>
          <a href="#user-types" className="hover:text-emerald-500 transition">{t.userTypes}</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative hidden sm:block" ref={langRef}>
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-teal-300 bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-100 transition">
              <Globe size={13} />
              <span>{LANGUAGES[lang].name}</span>
              <ChevronDown size={11} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {Object.values(LANGUAGES).map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full flex justify-between items-center px-4 py-3 text-sm transition ${lang === l.code ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <span>{l.name}</span>
                    <span className="text-[10px] text-slate-400">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/login" className="hidden sm:inline-block bg-teal-500 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-teal-600 transition">{t.login}</Link>
          <Link to="/signup" className="hidden sm:inline-block bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition">{t.signUp}</Link>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(v => !v)} className="sm:hidden text-slate-500 hover:text-slate-700">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          {[['#solutions', t.solutions], ['#how-it-works', t.howItWorks], ['#benefits', t.benefits], ['#user-types', t.userTypes]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 hover:text-teal-600 py-1">{label}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-teal-500 text-white py-2 rounded-lg text-sm font-bold">{t.login}</Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold">{t.signUp}</Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="pt-16 pb-24 text-center px-4">
        <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-full mb-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Fuel Management System</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">{t.appName}</h1>
        <p className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">{t.heroSubtitle}</p>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">{t.heroDesc}</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/login" className="bg-teal-500 text-white px-8 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-teal-600 transition">{t.login}</Link>
          <Link to="/signup" className="bg-emerald-500 text-white px-8 py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-600 transition">{t.signUp}</Link>
        </div>
      </header>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 lg:px-20 bg-slate-100/50 border-t border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-16">{t.howItWorks}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { id: 1, title: t.step1Title, desc: t.step1Desc },
            { id: 2, title: t.step2Title, desc: t.step2Desc },
            { id: 3, title: t.step3Title, desc: t.step3Desc },
          ].map(item => (
            <div key={item.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-teal-500 text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold mb-6">{item.id}</div>
              <h3 className="font-bold text-slate-900 mb-3 text-base">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* System Overview */}
      <section id="solutions" className="py-24 px-4 sm:px-8 lg:px-20 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 w-full">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-10">{t.overviewTitle}</h2>
            <div className="space-y-8">
              {[
                { label: t.feat1Label, text: t.feat1Text },
                { label: t.feat2Label, text: t.feat2Text },
                { label: t.feat3Label, text: t.feat3Text },
                { label: t.feat4Label, text: t.feat4Text },
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{f.label}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Mockup */}
          <div className="lg:w-1/2 w-full bg-slate-200 p-5 rounded-2xl border border-slate-300">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Live Queue: Station #942</span>
                <span className="bg-blue-100 text-blue-600 text-[9px] px-2 py-0.5 rounded font-bold">ACTIVE</span>
              </div>
              <div className="p-5 space-y-4">
                {[['4421', 'Next in line', true], ['4422', 'Waiting', false], ['4423', 'Waiting', false]].map(([pin, status, active]) => (
                  <div key={pin} className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                    <span className={`font-${active ? 'semibold text-slate-700' : 'medium text-slate-400'}`}>PIN: {pin}</span>
                    <span className={`text-[10px] font-bold ${active ? 'text-emerald-500' : 'text-slate-300'} uppercase`}>{status}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2">
                    <span>Petrol Supply</span><span>82%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full">
                    <div className="bg-teal-500 h-full w-[82%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section id="user-types" className="py-24 px-4 sm:px-8 lg:px-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-16">{t.designedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {[
            { badge: t.forDrivers, title: t.driverAccountTitle, features: [t.driverFeature1, t.driverFeature2, t.driverFeature3] },
            { badge: t.forStations, title: t.adminAccountTitle, features: [t.adminFeature1, t.adminFeature2, t.adminFeature3] },
          ].map((card, i) => (
            <div key={i} className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
              <div className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-4">{card.badge}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">{card.title}</h3>
              <ul className="space-y-4">
                {card.features.map(f => (
                  <li key={f} className="flex items-center text-sm text-slate-600">
                    <span className="text-emerald-400 mr-3 text-lg">•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why FuelFlow */}
      <section id="benefits" className="py-20 px-4 sm:px-8 lg:px-20 bg-slate-50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900 mb-16">{t.whyTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { title: t.why1Title, desc: t.why1Desc },
            { title: t.why2Title, desc: t.why2Desc },
            { title: t.why3Title, desc: t.why3Desc },
            { title: t.why4Title, desc: t.why4Desc },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-200 transition">
              <h4 className="font-bold text-sm text-slate-800 mb-2">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 pb-20">
        <div className="bg-emerald-900 rounded-3xl py-20 px-6 text-center text-white max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-6">{t.ctaTitle}</h2>
          <p className="text-emerald-100/70 text-sm sm:text-base mb-10 max-w-xl mx-auto">{t.ctaDesc}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/login" className="bg-white text-emerald-900 px-10 py-3 rounded-lg text-sm font-bold hover:bg-slate-100 transition">{t.login}</Link>
            <Link to="/signup" className="bg-teal-400 text-white px-10 py-3 rounded-lg text-sm font-bold hover:bg-teal-300 transition">{t.signUp}</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 lg:px-20 py-10 border-t border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <div className="font-bold text-emerald-500 text-lg mb-1">{t.appName}</div>
            <p className="text-slate-400 text-xs">{t.footerCopy}</p>
          </div>
          <div className="flex gap-6 text-slate-400 text-xs font-medium flex-wrap justify-center">
            {[t.privacyPolicy, t.termsOfService, t.contact, t.support].map(label => (
              <a key={label} href="#" className="hover:text-emerald-500 transition">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
