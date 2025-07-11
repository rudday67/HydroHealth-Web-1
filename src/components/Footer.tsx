import LogoHydroHealth2 from "../assets/images/logo/LogoHydroHealth2.png";
import { Image, Link } from "@nextui-org/react";
import { 
  // WhatsApp, 
  ShoppingBag, 
  Instagram, 
  Mail, 
  MapPin, 
  ExternalLink 
} from "react-feather";

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-green-50 to-white border-t border-green-100">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <div className="bg-white p-4 rounded-full shadow-md mb-4">
              <Image
                width={80}
                height={80}
                src={LogoHydroHealth2.src}
                alt="HydroHealth Logo"
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-2">HydroHealth</h2>
            <p className="text-gray-600 text-center md:text-left mb-4">
              &quot;Innovating Agriculture Through Technology&quot;
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              <a href="https://wa.me/yournumber" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors">
                <i className="fab fa-whatsapp text-green-600" style={{ fontSize: 20 }}></i>
              </a>
              <a href="https://instagram.com/hydrohealth.project" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="mailto:hydrohealth.team@gmail.com" className="text-green-600 hover:text-green-800 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors flex items-center">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors flex items-center">
                  <span>About</span>
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-600 hover:text-green-600 transition-colors flex items-center">
                  <span>Features</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-green-600 transition-colors flex items-center">
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="text-green-600 mt-1 mr-2 flex-shrink-0" size={18} />
                <a href="mailto:hydrohealth.team@gmail.com" className="text-gray-600 hover:text-green-600 transition-colors break-all">
                  hydrohealth.team@gmail.com
                </a>
              </div>
              <div className="flex items-start">
                <ShoppingBag className="text-green-600 mt-1 mr-2 flex-shrink-0" size={18} />
                <span className="text-gray-600">hydrohealth.mobile.app</span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700">Location</h3>
            <div className="flex items-start">
              <MapPin className="text-green-600 mt-1 mr-2 flex-shrink-0" size={18} />
              <a 
                href="https://maps.app.goo.gl/H2u9DoGydFsw6uu9A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Universitas Pendidikan Ganesha<br />
                Jinengdalem, Buleleng, Bali 81119
                <ExternalLink className="inline ml-1" size={14} />
              </a>
            </div>
            
            {/* Map Embed */}
            <div className="pt-2">
              <iframe
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.6861692693933!2d115.13055157575472!3d-8.133397481429773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd191df23585063%3A0xb4203c0eda012672!2sUndiksha%20Jinengdalem!5e0!3m2!1sid!2sid!4v1715692412864!5m2!1sid!2sid"
                width="100%"
                height="150"
                className="rounded-lg border border-green-200"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-green-100 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HydroHealth Project. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Part of Smart Green Garden Initiative
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;