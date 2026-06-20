import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Glossary', path: '/glossary' },
  ];

  return (
    <header className="bg-navy shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div>
            <div className="font-heading font-bold text-xl text-white leading-tight">SafeChart</div>
            <div className="text-xs font-medium" style={{ color: '#7FB5B0' }}>by PRISMqd</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
