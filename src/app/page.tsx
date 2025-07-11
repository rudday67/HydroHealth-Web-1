"use client";
import * as React from "react";
import Hero from "@/components/Hero";
import Collaboration from "@/components/Collaboration";
import Team from "@/components/Team";
import Features from "@/components/Features";
import Contact from "@/components/Contact";
import GalleryInstagram from "@/components/GalleryInstagram";


export default function LandingPage() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen pb-16">
      <div className="mt-8">
        <Hero />
      </div>
      <div id="feature">
        <Features />
      </div>
      
      <div id="contact">
        <Contact />
      </div>
      <div>
        <GalleryInstagram/>
      </div>
    </main>
  );
}
