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
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            What Our Customers Say
          </h2>
          <p className="testimonials-subtitle">
            Don't take our word for it - hear from dealership owners and sales managers who have transformed their business
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="star-icon" />
                ))}
              </div>
              
              <p className="testimonial-quote">
                "{testimonial.quote}"
              </p>
              
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.initials}
                </div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-title">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}