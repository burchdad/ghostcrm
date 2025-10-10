import Link from "next/link";

export default function Home() {
  return (
    <main className="home-container">
      <h1 className="home-title">Welcome to Ghost Auto CRM</h1>
      <p className="home-subtitle">
        Your AI-powered automotive CRM platform. Drive sales, manage leads, and close deals faster.
      </p>
      <Link href="/dashboard" className="home-cta">
        Go to Dashboard
      </Link>
    </main>
  );
}
