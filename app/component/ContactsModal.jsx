import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const ContactsModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus(null);

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    emailjs.send('service_ku9z9f3', 'template_b9u9v37', data, 'qC0LKDT7FBrnOeRe2')
      .then((response) => {
        setFormStatus('success');
        form.reset();
      }, (error) => {
        setFormStatus('error');
        console.error('Error sending email:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-lg text-indigo-950">
        {/* Close icon */}


         <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-black">Contact Me</h2>
            <div className="cursor-pointer" onClick={onClose}>
               <FontAwesomeIcon icon={faXmark} className="text-2xl text-gray-500 hover:text-gray-700" />
            </div>
         </div>
        <hr />
        
        {formStatus === 'success' && (
          <div className="my-2 text-green-500">Message sent successfully! I'll get back to you soon.</div>
        )}
        
        {formStatus === 'error' && (
          <div className="my-2 text-red-500">Oops! Something went wrong. Please try again.</div>
        )}
        
        <form id="contact-form" className="text-indigo-950" onSubmit={handleSubmit}>
          <input
            type="text"
            id="name"
            name="from_name"
            placeholder="Your Name"
            required
            className="w-full p-2 mb-4 text-black bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <input
            type="email"
            id="email"
            name="from_email"
            placeholder="Your Email"
            required
            className="w-full p-2 mb-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Your Message"
            required
            className="w-full p-2 mb-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-500"
          ></textarea>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-indigo-600 text-white p-2 rounded ${isSubmitting ? 'bg-indigo-600' : 'hover:bg-indigo-600'} focus:outline-none focus:ring-2 focus:ring-neutral-500`}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactsModal;
