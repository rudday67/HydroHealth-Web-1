import {
  Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Card,
  CardFooter,
} from "@nextui-org/react";
import LogoUndiksha from "@/assets/images/logo/LogoUndiksha.png";
import LogoDagoEngineering from "@/assets/images/logo/LogoDagoEng.png";
import LogoCGPDagoEng from "@/assets/images/logo/LogoCGPDagoEng.png";
import LogoDelectra from "@/assets/images/logo/LogoDelectra.png";
import FTKxDago from "@/assets/images/components/FTKxDago.png";

export default function Collaboration() {
  const partners = [
    {
      logo: LogoUndiksha,
      name: "Undiksha",
      description: "Fakultas Teknik dan Kejuruan",
      url: "https://undiksha.ac.id/",
      width: 80
    },
    {
      logo: LogoCGPDagoEng,
      name: "Clean & Green Power",
      description: "Bandung",
      url: "https://dagoeng.co.id/",
      width: 162
    },
    {
      logo: LogoDelectra,
      name: "Delectra",
      description: "Bandung",
      url: "https://delectra.id/",
      width: 238
    }
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-16" id="colab">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-4">
          Kolaborasi Strategis
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Membangun Ekosistem Inovasi melalui Kemitraan
        </p>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Partners Section */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <Popover key={index} placement="bottom" offset={10} showArrow>
                <PopoverTrigger>
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-center items-center h-full cursor-pointer">
                    <Image
                      width={partner.width}
                      className="object-contain hover:scale-105 transition-transform"
                      alt={partner.name}
                      src={partner.logo.src}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-bold">{partner.name}</h3>
                    <p className="text-sm text-gray-600">{partner.description}</p>
                    <Button
                      size="sm"
                      color="primary"
                      variant="light"
                      className="mt-2"
                      as="a"
                      href={partner.url}
                      target="_blank"
                    >
                      Kunjungi Website
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
            <p className="text-gray-700">
              Fakultas Teknik dan Kejuruan Universitas Pendidikan Ganesha (FTK-Undiksha) 
              telah menjalin kemitraan dengan PT. Dago Engineering di Bandung untuk 
              mengembangkan teknologi dalam program Merdeka Belajar Kampus Merdeka (MBKM).
            </p>
          </div>
        </div>

        {/* Image Card */}
        <Card 
          isFooterBlurred 
          radius="lg" 
          className="border-none h-full hover:shadow-xl transition-shadow"
        >
          <Image
            alt="Kolaborasi FTK Undiksha dan Dago Engineering"
            src={FTKxDago.src}
            removeWrapper
            className="z-0 w-full h-full object-cover"
          />
          <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600">
            <div className="flex flex-grow justify-center">
              <p className="text-white/90 font-medium">
                FTK Undiksha X Dago Engineering
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Description Section */}
      <div className="mt-16 bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Smart Green Garden Initiative
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-600">
              Teknologi Pertanian Masa Depan
            </h3>
            <p className="text-gray-700">
              Program ini mengembangkan pertanian hidroponik berbasis Internet of Things (IoT) 
              untuk monitoring real-time, kecerdasan buatan (AI) untuk analisis data, dan 
              energi terbarukan dari panel surya.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-600">
              Tujuan Kolaborasi
            </h3>
            <p className="text-gray-700">
              Mengintegrasikan teknologi tinggi dalam pertanian untuk meningkatkan efisiensi 
              dan mendukung praktik pertanian yang berkelanjutan dan ramah lingkungan, 
              sekaligus mempersiapkan mahasiswa menghadapi tantangan industri.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}