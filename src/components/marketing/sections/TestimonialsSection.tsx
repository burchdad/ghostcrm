import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Ghost Auto CRM transformed our dealership. We've seen a 45% increase in sales and our team is more organized than ever.",
    name: "Sarah Mitchell",
    title: "Sales Manager, Premier Auto",
    initials: "SM",
  },
  {
    quote: "The AI assistant is incredible. It helps our team follow up with leads at the perfect time and provides insights that we never had before.",
    name: "Mike Johnson", 
    title: "Owner, City Motors",
    initials: "MJ",
  },
  {
    quote: "Implementation was seamless and the support team is outstanding. We were up and running in less than a week.",
    name: "Lisa Rodriguez",
    title: "Director, AutoMax Group", 
    initials: "LR",
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't take our word for it - hear from dealership owners and sales managers who have transformed their business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}