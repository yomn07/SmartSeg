import React, { useState } from "react";
import Head from "./head";
import "./Contact.css";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // message de confirmation
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("");

    if (!isValidEmail(email)) {
      setStatus("Please enter a valid email.");
      return;
    }
    if (!message) {
      setStatus("Please enter your message.");
      return;
    }

    setLoading(true);

    // Simuler l'envoi du message
    setTimeout(() => {
      setStatus("Your message has been sent to the administrator.");
      setEmail("");
      setMessage("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="page">
      <Head loggedIn={false} />


      <div className="card">
        <h2>Contact Form</h2>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="your.email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Message</label>
          <textarea
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status && <p className="contact-status">{status}</p>}
      </div>
    </div>
  );
}