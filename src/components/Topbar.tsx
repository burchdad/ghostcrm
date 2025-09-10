export function Topbar() {
  return (
    <header className="p-4 border-b flex items-center justify-between bg-white">
      <input type="text" placeholder="Search..." className="border px-3 py-1 rounded w-1/3" />
      <div className="flex items-center gap-3">
        <button className="text-sm">AI Assistant</button>
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </header>
  );
}
