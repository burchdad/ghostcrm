import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Ghost Auto CRM</h1>
      <p className="mb-6 text-gray-600">Your modern CRM starter. Use the sidebar to navigate.</p>
      <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go to Dashboard</Link>
    </div>
  );
}
