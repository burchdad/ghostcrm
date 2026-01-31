import Link from "next/link";

export default function TenantNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z"
              />
            </svg>
          </div>
          
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Tenant Not Found
          </h3>
          
          <p className="mt-2 text-sm text-gray-600">
            This subdomain doesn't exist or hasn't been activated yet.
            The organization may be in the process of setting up their account.
          </p>
          
          <div className="mt-6 flex flex-col space-y-3">
            <Link
              href="https://ghostcrm.ai"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to GhostCRM Home
            </Link>
            
            <Link
              href="https://ghostcrm.ai/login"
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In to Your Account
            </Link>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            If you believe this is an error, please contact support or check with your organization administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Tenant Not Found - GhostCRM",
  description: "The requested tenant subdomain was not found or is not active.",
  robots: "noindex, nofollow", // Don't index these error pages
};