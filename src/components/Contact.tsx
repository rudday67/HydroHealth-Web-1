"use client";
import { useState } from "react";
import { Button, Input, Textarea } from "@nextui-org/react";
import { Mail, MapPin, Phone, Send, Facebook, Instagram } from "react-feather";
import { FaWhatsapp } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-green-700 mb-4">Contact Us</h1>
        <div className="w-24 h-1 bg-green-500 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions or feedback? We&apos;d love to hear from you!
        </p>
      </div>

      {/* Contact Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="bordered"
              classNames={{
                inputWrapper: "border-gray-300 hover:border-green-500",
                label: "text-gray-700"
              }}
            />
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="bordered"
              classNames={{
                inputWrapper: "border-gray-300 hover:border-green-500",
                label: "text-gray-700"
              }}
              endContent={
                <Mail className="text-gray-400" size={18} />
              }
            />
            
            <Textarea
              label="Your Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              variant="bordered"
              minRows={5}
              classNames={{
                inputWrapper: "border-gray-300 hover:border-green-500",
                label: "text-gray-700"
              }}
            />
            
            <Button
              type="submit"
              color="success"
              className="w-full font-medium"
              isLoading={isSubmitting}
              endContent={!isSubmitting && <Send size={18} />}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-green-50 p-8 rounded-xl border-l-4 border-green-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Mail className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Email</h3>
                  <a 
                    href="mailto:hydrohealth.team@gmail.com" 
                    className="text-green-600 hover:underline"
                  >
                    hydrohealth.team@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Phone className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Phone</h3>
                  <a 
                    href="tel:+1234567890" 
                    className="text-green-600 hover:underline"
                  >
                    +62 123 4567 890
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <MapPin className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Address</h3>
                  <p className="text-gray-600">
                    Universitas Pendidikan Ganesha<br />
                    Jinengdalem, Buleleng, Bali 81119
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/H2u9DoGydFsw6uu9A" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm mt-1 inline-flex items-center hover:underline"
                  >
                    View on Google Maps <span className="ml-1 text-green-600">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="font-semibold text-gray-800 mb-4">Follow us</h3>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/hydrohealth.project" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 p-3 rounded-full text-green-600 hover:bg-green-100 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://wa.me/yournumber" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 p-3 rounded-full text-green-600 hover:bg-green-100 transition-colors"
              >
                <FaWhatsapp size={20} />
              </a>
              <a 
                href="https://facebook.com/yourpage" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 p-3 rounded-full text-green-600 hover:bg-green-100 transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}