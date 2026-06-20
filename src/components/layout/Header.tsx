import { useState } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/quick', label: 'Quick Entry' },
  { to: '/module1', label: 'Acuity' },
  { to: '/module2', label: 'Checklist' },
  { to: '/module3', label: 'Escalation' },
  { to: '/report', label: 'Report' },
  { to: '/module8', label: 'Submit' },
  { to: '/glossary', label: 'Glossary' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => {
    const hash = window.location.hash.replace('#', '') || '/';
    if (to === '/') return hash === '/' || hash === '';
    return hash.startsWith(to);
  };

  return (
    <header className="bg-navy shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-heading font-bold text-white text-2xl">SafeChart</span>
          <span className="text-sage text-sm font-body">by PRISMqd</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 items-center">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded text-sm font-body transition-colors ${
                isActive(link.to)
                  ? 'text-white bg-white bg-opacity-15'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white border-opacity-20 bg-navy">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-white hover:bg-opacity-10 font-body border-b border-white border-opacity-10"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
