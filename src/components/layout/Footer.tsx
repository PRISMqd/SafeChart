import { REQUIRED_DISCLOSURE } from '../../lib/reportTranslator';

export function Footer() {
  return (
    <footer className="bg-navy/5 border-t border-gray-200 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-500 leading-relaxed">{REQUIRED_DISCLOSURE}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 Jennifer Torrez / PRISMqd. All rights reserved.</span>
          <span>SafeChart v1.0 — Phase 1 MVP</span>
        </div>
      </div>
    </footer>
  );
}
