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
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Dealerships Worldwide
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of automotive professionals who have transformed their business with Ghost Auto CRM
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-blue-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}