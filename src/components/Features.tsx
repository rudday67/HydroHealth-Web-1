import Fitur1 from "../assets/images/components/Fitur1.jpg";
import Fitur2 from "../assets/images/components/Fitur2.jpg";
import Fitur3 from "../assets/images/components/Fitur3.jpg";
import Fitur4 from "../assets/images/components/Fitur4.jpg";
import { Card, CardBody, Image, Chip, Divider } from "@nextui-org/react";
import { FaLeaf, FaBug, FaThermometerHalf, FaWater, FaMobileAlt, FaShieldAlt, FaSprayCan } from "react-icons/fa";
import { GiPlantWatering } from "react-icons/gi";

const features = [
  {
    icon: <FaLeaf className="text-3xl text-green-500" />,
    title: "Monitoring Tanaman Dengan Kamera",
    description: "Memantau perkembangan tanaman dan mendeteksi hama serta penyakit tanaman secara visual.",
    color: "bg-green-100"
  },
  {
    icon: <FaBug className="text-3xl text-red-500" />,
    title: "Deteksi Hama & Penyakit Menggunakan AI",
    description: "Menggunakan model Deep Learning untuk deteksi objek hama dan klasifikasi penyakit tanaman.",
    color: "bg-red-100"
  },
  {
    icon: <GiPlantWatering className="text-3xl text-blue-500" />,
    title: "Monitoring & Kontrol Nutrisi Tanaman",
    description: "Sensor TDS memantau PPM air hidroponik dengan penyesuaian otomatis menggunakan dosing pump.",
    color: "bg-blue-100"
  },
  {
    icon: <FaThermometerHalf className="text-3xl text-amber-500" />,
    title: "Monitoring Suhu Udara",
    description: "Sensor suhu terintegrasi untuk memastikan kondisi optimal pertumbuhan tanaman.",
    color: "bg-amber-100"
  },
  {
    icon: <FaWater className="text-3xl text-cyan-500" />,
    title: "Monitoring & Kontrol pH Air",
    description: "Sensor pH menjaga kestabilan kadar keasaman air untuk pertumbuhan tanaman optimal.",
    color: "bg-cyan-100"
  },
  {
    icon: <FaMobileAlt className="text-3xl text-purple-500" />,
    title: "Sistem Notifikasi Mobile",
    description: "Peringatan real-time melalui aplikasi mobile untuk setiap perubahan kondisi tanaman.",
    color: "bg-purple-100"
  },
  {
    icon: <FaShieldAlt className="text-3xl text-emerald-500" />,
    title: "Pelindung Hama Otomatis",
    description: "Servo motor menutup sistem hidroponik saat malam hari untuk melindungi dari hama.",
    color: "bg-emerald-100"
  },
  {
    icon: <FaSprayCan className="text-3xl text-lime-500" />,
    title: "Penyiraman Pestisida & Pupuk Otomatis",
    description: "Sistem otomatis dengan pengaturan waktu untuk penyiraman pestisida dan pupuk daun.",
    color: "bg-lime-100"
  }
];

export default function Features() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        {/* <Chip color="success" variant="flat" className="mb-4">Fitur Unggulan</Chip> */}
        <h2 className="text-4xl font-bold mb-2">Teknologi Canggih untuk Pertanian Modern</h2>
        <p className="text-lg text-default-500">Solusi lengkap untuk monitoring dan perawatan tanaman hidroponik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className={`${feature.color} hover:shadow-lg transition-all duration-300 h-full`}
            isHoverable
          >
            <CardBody className="p-6">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">{feature.title}</h3>
              <p className="text-default-700 text-center">{feature.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Divider className="my-12" />

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="lg:w-1/2">
          <Image
            isZoomed
            src={Fitur1.src}
            alt="Demo Produk"
            className="rounded-xl shadow-lg"
          />
        </div>
        <div className="lg:w-1/2">
          <h3 className="text-2xl font-bold mb-4">Keunggulan Sistem Kami</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="bg-green-500 text-white p-1 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Integrasi lengkap antara hardware dan software</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-500 text-white p-1 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Kontrol otomatis berbasis kondisi real-time</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-500 text-white p-1 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Notifikasi langsung ke perangkat mobile</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-500 text-white p-1 rounded-full mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Teknologi AI untuk deteksi hama dan penyakit</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}