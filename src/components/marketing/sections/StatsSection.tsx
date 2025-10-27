import React from "react";

const stats = [
  {
    number: "2,500+",
    label: "Active Dealerships"
  },
  {
    number: "40%", 
    label: "Average Sales Increase"
  },
  {
    number: "98%",
    label: "Customer Satisfaction"
  },
  {
    number: "24/7",
    label: "Expert Support"
  }
];

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-header">
          <h2 className="stats-title">
            Trusted by Dealerships Worldwide
          </h2>
          <p className="stats-subtitle">
            Join thousands of automotive professionals who have transformed their business with Ghost Auto CRM
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">
                {stat.number}
              </div>
              <div className="stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}