import React from "react";

const images = [
  "./src/assets/garden1.png",
  "./src/assets/garden2.png",
  "./src/assets/garden3.png",
  "./src/assets/garden4.png",
  "./src/assets/garden5.png",
];

export default function Hero() {
  return (
    <section className="px-8 py-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12  text-green-900">
      {/* Text Content */}
      <div className="flex-1 max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Let’s Grow <br />
          Your Dream <br />
          Garden
        </h1>
        <p className="text-green-700 mb-8">
          Discover expert plant care, inspiring designs, and practical gardening guides for every skill level. <br />
          Nurture nature and bring lush serenity to your space!
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:underline font-semibold text-green-900">
            Explore Guides →
          </a>
        </div>
      </div>

      <div className="relative w-110 h-[520px] flex flex-col justify-between ">
        <img src={images[0]} alt="Lush garden" className="rounded-xl object-cover w-[170px] h-[200px] absolute top-13 left-0 shadow-lg hover:scale-110 transition-transform duration-300" style={{ zIndex: 10 }} />
        <img src={images[1]} alt="Flower bed" className="rounded-xl object-cover w-[170px] h-[235px] absolute top-3 right-20 shadow-lg hover:scale-110 transition-transform duration-300" style={{ zIndex: 20 }} />
        <img src={images[2]} alt="Gardening tools" className="rounded-xl object-cover w-[170px] h-[235px] absolute bottom-3 right-20 shadow-lg hover:scale-110 transition-transform duration-300" style={{ zIndex: 10 }} />
        <img src={images[3]} alt="People gardening" className="rounded-xl object-cover w-[170px] h-[200px] absolute bottom-13 left-0 shadow-lg hover:scale-110 transition-transform duration-300" style={{ zIndex: 20 }} />
        <img src={images[4]} alt="Green plants" className="rounded-xl object-cover w-[180px] h-[410px] absolute top-15 left-94 shadow-lg hover:scale-110 transition-transform duration-300" style={{ zIndex: 20 }} />
      </div>
    </section>
  );
}