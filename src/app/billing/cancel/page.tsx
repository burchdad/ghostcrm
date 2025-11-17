import { XCircle } from 'lucide-react'
import Link from 'next/link'
import './page.css'

export default function CheckoutCancelPage() {
  return (
    <div className="cancel-page-container">
      <div className="cancel-main-wrapper">
        <div className="cancel-card">
          <div className="cancel-content">
            <XCircle className="cancel-main-icon" />
            <h2 className="cancel-title">
              Checkout Cancelled
            </h2>
            <p className="cancel-subtitle">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="cancel-actions">
            <div className="warning-notice">
              <div className="warning-content">
                <XCircle className="warning-icon" />
                <div className="warning-details">
                  <h3 className="warning-title">
                    Payment Not Processed
                  </h3>
                  <div className="warning-message">
                    <p>
                      You can return to our pricing page to select a plan or contact support if you need assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <Link
                href="/billing"
                className="primary-button"
              >
                View Pricing Plans
              </Link>
              
              <Link
                href="/dashboard"
                className="secondary-button"
              >
                Back to Dashboard
              </Link>
            </div>

            <div className="support-footer">
              <p className="support-notice">
                Need help? Contact us at{' '}
                <a 
                  href="mailto:support@ghostcrm.com" 
                  className="support-email-link"
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