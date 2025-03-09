"use client";

import { useState } from "react";
import { FaCircleUser, FaHeading, FaAlignLeft, FaEnvelope } from "react-icons/fa6";

export default function ContactsSection() {
   const [formData, setFormData] = useState({
      senderEmail: "",
      senderSubject: "",
      senderMessage: "",
   });
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState("");
   const [error, setError] = useState("");

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setSuccess("");
      setError("");

      try {
         const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         const data = await response.json();
         if (!response.ok) throw new Error(data.error);

         setSuccess("✅ Email sent successfully!");
         setFormData({ senderEmail: "", senderSubject: "", senderMessage: "" });

      } catch (error) {
         setError("❌ Failed to send email. Please try again.");
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="flex flex-row justify-center min-h-screen items-center"  id="contact">
         <form onSubmit={handleSubmit} className="rounded-lg bg-stone-500 w-full min-h-96 max-w-3xl shadow flex flex-row">

            <div className="md:w-2/6 md:block hidden">
               <img src="profile.webp" alt="Christian James Santos' Profile Picture"
                  className="w-full h-full rounded-l-lg bg-gradient-to-br from-pink-500 to-pink-600 object-cover object-left" />
            </div>

            <div className="md:w-4/6 w-full">
               <div className="pt-4 pb-3 border-b-2 border-pink-500">
                  <h1 className="poppins text-3xl text-center">Send me an Email</h1>
               </div>
               <div className="py-4 px-8 space-y-3">
                  
                  <div className="form-group">
                     <label htmlFor="senderEmail" className="flex items-center">
                        <FaCircleUser className="me-2" /> Your Email
                     </label>
                     <input type="email" id="senderEmail" value={formData.senderEmail} onChange={handleChange}
                        placeholder="yourEmail@domain.com" required className="w-full p-2 rounded-md" />
                  </div>

                  <div className="form-group">
                     <label htmlFor="senderSubject" className="flex items-center">
                        <FaHeading className="me-2" /> Email Subject
                     </label>
                     <input type="text" id="senderSubject" value={formData.senderSubject} onChange={handleChange}
                        placeholder="Your Subject" required className="w-full p-2 rounded-md verify" />
                  </div>

                  <div className="form-group">
                     <label htmlFor="senderMessage" className="flex items-center">
                        <FaAlignLeft className="me-2" /> Your Message
                     </label>
                     <textarea id="senderMessage" value={formData.senderMessage} onChange={handleChange}
                        placeholder="Your message goes here." required rows={4} className="w-full p-2 rounded-md"></textarea>
                  </div>

                  <div>
                     <button type="submit" disabled={loading} className="btn-primary w-full rounded-full bg-pink-500 flex items-center justify-center p-2">
                        {loading ? <>Sending Email...</>: <><FaEnvelope className="me-2" /> Send Email</>}
                     </button>
                  </div>

                  {success && <p className="text-green-500 text-center">{success}</p>}
                  {error && <p className="text-red-500 text-center">{error}</p>}

               </div>
            </div>

         </form>
      </section>
   );
}
