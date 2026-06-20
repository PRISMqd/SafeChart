import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-navy shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-heading font-bold text-white text-2xl">SafeChart</span>
          <span className="text-teal text-sm font-body">by PRISMqd</span>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link to="/glossary" className="text-gray-300 hover:text-white text-sm font-body transition-colors">Glossary</Link>
        </nav>
      </div>
    </header>
  );
}
