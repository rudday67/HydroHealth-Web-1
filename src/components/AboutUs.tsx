import { Card, CardFooter, Image } from "@nextui-org/react";
import TeamPic from "@/assets/images/components/TeamPic.jpg";

export default function AboutUs() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-4">
          About Us HydroHealth
        </h1>
        <div className="w-24 h-1 bg-teal-500 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Inovasi Pertanian Masa Depan dengan Teknologi Canggih
        </p>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Image Card */}
        <Card 
          isFooterBlurred 
          radius="lg" 
          className="border-none h-full hover:shadow-xl transition-shadow duration-300"
        >
          <Image
            alt="Tim HydroHealth"
            src={TeamPic.src}
            removeWrapper
            className="z-0 w-full h-full object-cover"
          />
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
            <div className="flex flex-grow gap-2 items-center">
              <p className="text-white font-medium">
                Tim Smart Green Garden - Undiksha
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Text Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Kolaborasi FTK-Undiksha dan PT. Dago Engineering
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Fakultas Teknik dan Kejuruan Universitas Pendidikan Ganesha (FTK-Undiksha) 
              berkolaborasi dengan PT. Dago Engineering Bandung untuk mengembangkan 
              teknologi dalam program Merdeka Belajar Kampus Merdeka (MBKM).
            </p>
            
            <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
              <p className="font-medium text-teal-800">
                Smart Green Garden mengembangkan pertanian hidroponik berbasis:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-teal-700">
                <li>Internet of Things (IoT) untuk monitoring real-time</li>
                <li>Artificial Intelligence (AI) untuk analisis data</li>
                <li>Energi terbarukan dari panel surya</li>
              </ul>
            </div>
            
            <p>
              Program ini bertujuan meningkatkan kualitas pendidikan sekaligus 
              mengembangkan teknologi pertanian berkelanjutan. Mahasiswa mendapatkan 
              pengalaman praktis dengan teknologi terkini untuk mempersiapkan 
              mereka di dunia kerja.
            </p>
          </div>
          
          <button className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Pelajari Lebih Lanjut
          </button>
        </div>
      </div>

      {/* Values Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Inovasi",
            desc: "Mengembangkan solusi pertanian berbasis teknologi terkini",
            icon: "💡"
          },
          {
            title: "Kolaborasi",
            desc: "Kerja sama antara akademisi dan industri",
            icon: "🤝"
          },
          {
            title: "Keberlanjutan",
            desc: "Pertanian ramah lingkungan dengan energi terbarukan",
            icon: "🌱"
          }
        ].map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}