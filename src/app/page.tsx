import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome to Ghost Auto CRM</h1>
      <p className="text-gray-600 mb-6">Your modern CRM starter. Use the sidebar to navigate.</p>
      <Link
        href="/dashboard"
        className="inline-block rounded bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
