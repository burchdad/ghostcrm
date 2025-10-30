import { XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Checkout Cancelled
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Payment Not Processed
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You can return to our pricing page to select a plan or contact support if you need assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/billing"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Pricing Plans
              </Link>
              
              <Link
                href="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact us at{' '}
                <a 
                  href="mailto:support@ghostcrm.com" 
                  className="text-blue-600 hover:text-blue-500"
                >
                  support@ghostcrm.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}