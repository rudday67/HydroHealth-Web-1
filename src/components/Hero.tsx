"use client";
import Link from "next/link";
import HeroImage from "../assets/images/components/hero2.png";
import LogoUndiksha from "../assets/images/logo/LogoUndiksha.png";
import LogoDagoEngPolos from "../assets/images/logo/LogoDagoEngPolos.png";
import { Card, Image } from "@nextui-org/react";

export default function Hero() {
  return (
    <div className="py-16 px-4 relative overflow-hidden">
      {/* Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50 -z-10 rounded-l-full"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Image with Card */}
          <div className="lg:w-2/5 relative">
            <Card className="border-none shadow-xl">
              <Image 
                src={HeroImage.src} 
                alt="Hero Image" 
                className="w-full h-auto"
              />
            </Card>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-100">
              <div className="flex gap-2">
                <Image src={LogoUndiksha.src} alt="Logo Undiksha" className="h-10" />
                <Image src={LogoDagoEngPolos.src} alt="Logo Dago Eng" className="h-10" />
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="lg:w-3/5 space-y-6 pl-0 lg:pl-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              <span className="text-green-600">Smart Green Garden</span><br />
              Solusi Pertanian Masa Depan
            </h1>
            
            <p className="text-gray-600 text-lg">
              Kolaborasi FTK-Undiksha dan PT. Dago Engineering dalam mengembangkan pertanian hidroponik berbasis IoT dan AI melalui program MBKM.
            </p>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Teknologi Hidroponik</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Internet of Things</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Artificial Intelligence</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Energi Terbarukan</span>
              </li>
            </ul>
            
            <Link href="/about" className="inline-block mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300">
              Jelajahi Inovasi Kami →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}