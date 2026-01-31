"use client";

import React, { useState } from "react";
import { X, Phone, Mail, Calendar, MessageCircle, Clock, Send } from "lucide-react";
import "./ContactSalesModal.css";

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSalesModal({ isOpen, onClose }: ContactSalesModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dealership: "",
    phone: "",
    message: "",
    preferredContact: "email",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit contact form");

      const result = await response.json();
      console.log("Contact form submitted:", result);
      setSubmitted(true);
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Sorry, there was an error submitting your message. Please try contacting us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="success-container">
            <div className="success-icon">
              <svg className="checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="success-title">Thank You!</h2>
            <p className="success-message">
              We've received your message and a sales representative will contact you within 24 hours.
            </p>
            <button onClick={onClose} className="success-button">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="modal-header">
              <div className="header-content">
                <h2 className="modal-title">Contact Sales</h2>
                <p className="modal-subtitle">Get in touch with our automotive CRM experts</p>
              </div>
              <button onClick={onClose} className="close-button" aria-label="Close">
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-body">
              {/* Left Column - Contact Options */}
              <div className="contact-section">
                <h3 className="section-title">Get In Touch</h3>
                
                <div className="contact-options">
                  {/* Call Now */}
                  <div 
                    className="contact-card contact-card-call"
                    onClick={() => (window.location.href = "tel:+1-800-555-0123")}
                  >
                    <div className="contact-icon contact-icon-call">
                      <Phone className="icon" />
                    </div>
                    <div className="contact-info">
                      <h4 className="contact-title">Call Now</h4>
                      <p className="contact-detail">+1 (800) 555-0123</p>
                      <p className="contact-note">Mon-Fri 8AM-6PM EST</p>
                    </div>
                  </div>

                  {/* Email Sales */}
                  <div 
                    className="contact-card contact-card-email"
                    onClick={() => (window.location.href = "mailto:sales@ghostcrm.com?subject=Sales%20Inquiry")}
                  >
                    <div className="contact-icon contact-icon-email">
                      <Mail className="icon" />
                    </div>
                    <div className="contact-info">
                      <h4 className="contact-title">Email Sales</h4>
                      <p className="contact-detail">sales@ghostcrm.com</p>
                      <p className="contact-note">Response within 2 hours</p>
                    </div>
                  </div>

                  {/* Schedule Demo */}
                  <div 
                    className="contact-card contact-card-demo"
                    onClick={() => window.open("https://calendly.com/ghostautocrm/demo", "_blank")}
                  >
                    <div className="contact-icon contact-icon-demo">
                      <Calendar className="icon" />
                    </div>
                    <div className="contact-info">
                      <h4 className="contact-title">Schedule Demo</h4>
                      <p className="contact-detail">Book a personalized demo</p>
                      <p className="contact-note">30-minute consultation</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div 
                    className="contact-card contact-card-whatsapp"
                    onClick={() => window.open("https://wa.me/18005550123?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%20Ghost%20Auto%20CRM.", "_blank")}
                  >
                    <div className="contact-icon contact-icon-whatsapp">
                      <MessageCircle className="icon" />
                    </div>
                    <div className="contact-info">
                      <h4 className="contact-title">WhatsApp</h4>
                      <p className="contact-detail">Quick chat support</p>
                      <p className="contact-note">Instant messaging</p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="business-hours">
                  <div className="hours-header">
                    <Clock className="hours-icon" />
                    <h4 className="hours-title">Business Hours</h4>
                  </div>
                  <div className="hours-list">
                    <div className="hours-item">
                      <span className="day">Monday - Friday:</span>
                      <span className="time">8:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="hours-item">
                      <span className="day">Saturday:</span>
                      <span className="time">9:00 AM - 2:00 PM EST</span>
                    </div>
                    <div className="hours-item">
                      <span className="day">Sunday:</span>
                      <span className="time">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="form-section">
                <h3 className="section-title">Send a Message</h3>
                
                <form onSubmit={handleSubmit} className="contact-form">
                  {/* Name and Email Row */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="john@dealership.com"
                      />
                    </div>
                  </div>

                  {/* Dealership Name */}
                  <div className="form-group">
                    <label className="form-label">Dealership Name</label>
                    <input
                      type="text"
                      name="dealership"
                      value={formData.dealership}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Premier Auto Sales"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="form-group">
                    <label className="form-label">Preferred Contact Method</label>
                    <select
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleInputChange}
                      className="form-input form-select"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-input form-textarea"
                      placeholder="Tell us about your dealership and how we can help..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`submit-button ${isSubmitting ? 'submit-loading' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="submit-icon" />
                        Send Message
                      </>
                    )}
                  </button>

                  {/* Privacy Notice */}
                  <p className="privacy-notice">
                    By submitting this form, you agree to be contacted by our sales team
                  </p>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}