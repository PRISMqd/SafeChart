export default function QuickExit() {
  const handleExit = () => {
    // Clear sensitive session state, navigate to a neutral page
    sessionStorage.clear();
    window.location.replace('https://www.google.com');
  };

  return (
    <button
      onClick={handleExit}
      aria-label="Quick exit — leaves this site immediately"
      title="Quick exit — leaves this site immediately"
      className="fixed bottom-4 right-4 z-50 bg-gray-700 hover:bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg transition-colors select-none"
      style={{ fontFamily: 'sans-serif' }}
    >
      ✕ Exit
    </button>
  );
}
