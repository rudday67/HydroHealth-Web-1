"use client";
import { Tooltip, Typography } from "@mui/material";
import { useAuth } from "@/middleware/AuthenticationProviders";
import AuthenticationForm from "../../components/AuthenticationForm";
import PompaControl from "../../components/PompaControl";
import NutritionControl from "../../components/TDSControl";
import PengadukControl from "../../components/PengadukControl";
import PelindungControl from "../../components/PelindungControl";
import PestisidaControl from "../../components/PestisidaControl";
import PupukDaunControl from "../../components/PupukDaunControl";
import PhControl from "../../components/PhControl";
// import SuhuControl from "../../components/SuhuControl";
import KualitasAir from "@/components/KualitasAir";
import Kekeruhan from "@/components/Kekeruhan";
import KetinggianAir from "@/components/KetinggianAir";
import KetinggianAirDua from "@/components/KetinggianAirDua";
import AliranAir from "@/components/AliranAir";
// import Camera1 from "../../components/Camera1";
import { Button, useDisclosure, Image, Card, CardFooter } from "@nextui-org/react";
import PembuanganAirPipa from "@/components/PembuanganAirPipa";
import SumberAir from "@/components/SumberAirControl";
import PembuanganAirKontainer from "@/components/PembuanganAirKontainer";
import AlertCheckAuth from "@/components/AlertCheckAuth";
import AlertLoginGuest from "@/components/AlertLoginGuest";
import AlertAuthorizedMember from "@/components/AlertAuthorizedMember";
import AddTanaman from "@/components/AddTanaman";
import { ref, onValue, limitToLast, query } from "firebase/database";
import { database } from "../../../firebaseConfig";
import React, { useRef, useState, useEffect } from "react";
import LogActivity from "@/components/LogActivity";
import { LinearProgress } from "@mui/material";
import { Opacity, Science, WaterDrop, Nature, LocalFlorist, BugReport, Cloud } from "@mui/icons-material";
import SensorsIcon from '@mui/icons-material/Sensors';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';


// Import Axios for API requests (install axios if not installed yet)
import axios from "axios";

interface SensorData {
  timestamp?: number;
  // Properti lainnya
}


export default function Monitoring() {
  const user = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [sisaNutrisiAB, setSisaNutrisiAB] = useState<number>(0);
  const [pHDown, setPHDown] = useState<number>(0);
  const [pHUp, setPHUp] = useState<number>(0);
  const [sisaKontainer, setSisaKontainer] = useState<number>(0);
  const [sisaPupukDaun, setSisaPupukDaun] = useState<number>(0);
  const [sisaPestisida, setSisaPestisida] = useState<number>(0);
  const [weatherInfo, setWeatherInfo] = useState<any>(null); // State untuk menyimpan data cuaca
  const [sensorStatus, setSensorStatus] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const sensorRef = ref(database, "Monitoring/SensorData");
    const latestQuery = query(sensorRef, limitToLast(1));
  
    onValue(latestQuery, (snapshot) => {
      if (snapshot.exists()) {
        const latestData: { [key: string]: SensorData } = snapshot.val();
        const latestEntry = Object.values(latestData)[0];
  
        if (latestEntry && latestEntry.timestamp) {
          const latestTimestamp = latestEntry.timestamp;
          const currentTime = Date.now();
          const timeDifference = currentTime - latestTimestamp;
  
          // Set sensor status based on time difference
          if (timeDifference <= 30000) { // 30 detik
            setSensorStatus(<SensorsIcon />);
          } else {
            setSensorStatus(<SensorsOffIcon />);
          }
        } else {
          setSensorStatus(<SensorsOffIcon />);
        }
      } else {
        setSensorStatus(<SensorsOffIcon />);
      }
    });
  }, []);
  


  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "member" || user.role === "registered") {
        setIsAuthorized(true);
      }
      setIsCheckingAuth(false);
    } else {
      setIsCheckingAuth(false);
    }
  }, [user]);


  //Sisa Nutrisi
  useEffect(() => {
    try {
      const nutrisiRef = ref(database, "Monitoring");
      const latestQuery = query(nutrisiRef, limitToLast(1));

      onValue(latestQuery, (latestSnapshot) => {
        latestSnapshot.forEach((latestDataSnapshot) => {
          const latestData = latestDataSnapshot.val();
          if (latestData && latestData.SisaNutrisi) {
            setSisaNutrisiAB(parseFloat(latestData.SisaNutrisi)); 
          }
        });
      });
    } catch (error) {
      console.error("Error fetching latest Nutrisi:", error);
    }
  }, []);

  //Sisa pH Down
  useEffect(() => {
    try {
      const phDownRef = ref(database, "Monitoring");
      const latestQuery = query(phDownRef, limitToLast(1));

      onValue(latestQuery, (latestSnapshot) => {
        latestSnapshot.forEach((latestDataSnapshot) => {
          const latestData = latestDataSnapshot.val();
          if (latestData && latestData.SisaPhDown) {
            setPHDown(parseFloat(latestData.SisaPhDown)); 
          }
        });
      });
    } catch (error) {
      console.error("Error fetching latest pH Down:", error);
    }
  }, []);

  //Sisa Pupuk Daun
  useEffect(() => {
    try {
      const pupukDaunRef = ref(database, "Monitoring");
      const latestQuery = query(pupukDaunRef, limitToLast(1));

      onValue(latestQuery, (latestSnapshot) => {
        latestSnapshot.forEach((latestDataSnapshot) => {
          const latestData = latestDataSnapshot.val();
          if (latestData && latestData.SisaPupukDaun) {
            setSisaPupukDaun(parseFloat(latestData.SisaPupukDaun)); 
          }
        });
      });
    } catch (error) {
      console.error("Error fetching latest Pupuk Daun:", error);
    }
  }, []);

  //Sisa Pestisida
  useEffect(() => {
    try {
      const pestisidaRef = ref(database, "Monitoring");
      const latestQuery = query(pestisidaRef, limitToLast(1));

      onValue(latestQuery, (latestSnapshot) => {
        latestSnapshot.forEach((latestDataSnapshot) => {
          const latestData = latestDataSnapshot.val();
          if (latestData && latestData.SisaPestisida) {
            setSisaPestisida(parseFloat(latestData.SisaPestisida)); 
          }
        });
      });
    } catch (error) {
      console.error("Error fetching latest Pestisida:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "member" || user.role === "registered") {
        setIsAuthorized(true);
      }
      setIsCheckingAuth(false);
    } else {
      setIsCheckingAuth(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          `http://api.openweathermap.org/data/2.5/weather?q=Jakarta,id&appid=${process.env.NEXT_PUBLIC_VERCEL_WEATHER}&units=metric`
        );
        setWeatherInfo(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, []);

  if (isCheckingAuth) {
    return <AlertCheckAuth />;
  }

  if (!user) {
    return <AlertLoginGuest />;
  }

  if (!isAuthorized) {
    return <AlertAuthorizedMember />;
  }

  const renderProgressBar = (label: string, value: number, IconComponent: any) => (
    <div className="flex flex-col items-center bg-green-200 p-3 rounded-xl">
      <div className="flex items-center">
        <IconComponent className="text-emerald-500 mr-2" />
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <LinearProgress variant="determinate" value={(value / 5) * 100} className="w-full mt-2" />
      <p className="text-xs mt-1">{value} Liter</p>
    </div>
  );

  return (
    <main className="flex flex-col justify-center min-h-screen mx-2 items-center gap-3">
        <>
          <div className="flex flex-col justify-center items-center">
            <div className="text-center mt-12 p-4">
              <div>
                <p className="text-xl sm:text-3xl font-bold pb-2">
                  Selamat datang di halaman{" "}
                  <span className="font-bold text-emerald-500">
                    Kontrol dan Monitoring
                  </span>
                  , {user ? user.displayName : ""}👋
                </p>
                <p className="text-base sm:text-sm font-sm text-gray-700">
                  Status Sensor:{" "}
                  <Tooltip  title="Hijau: Wifi on/Kelistrikan on">
                  <span className={`font-sm ${sensorStatus === <SensorsIcon/> ? "text-green-500" : "text-green-500"}`}>
                    {sensorStatus}
                  </span>
                  </Tooltip>
                </p>
              </div>
              {/* <Camera1 /> */}
            </div>
             {/* Render only if the user is an admin */}
             {user.role === "admin" && (
              <>
                <div className="flex border mt-4 p-2 rounded-lg flex-col outline outline-2 justify-center items-center gap-4">
                  <p className="font-semibold text-base sm:text-xl pt-4">
                    Kontrol Hidroponik
                  </p>
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2 justify-center">
                    <PelindungControl />
                    <PengadukControl />
                    <PupukDaunControl />
                    <PestisidaControl />
                    <PompaControl />
                    <SumberAir />
                    <PembuanganAirKontainer />
                    <PembuanganAirPipa />
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-2 w-full sm:w-10/12 mx-auto text-sm outline outline-2 rounded-lg mt-4">
                  <p className="font-semibold text-base sm:text-xl  pt-4">
                    Manajemen Tanaman
                  </p>
                  <AddTanaman />
                </div>
              </>
            )}
          </div>
          <div className="flex p-2 border mt-4 rounded-lg justify-center w-full outline outline-2 items-center flex-col">
            <p className="font-semibold text-base sm:text-xl py-4">
              Monitoring Hidroponik
            </p>
            {/* <div className="grid grid-cols-1 mb-2 sm:grid-cols-2 gap-4 w-full sm:w-[70%] items-center sm:mx-12">
              {renderProgressBar("Sisa Larutan Pupuk Daun", sisaPupukDaun, LocalFlorist)}
              {renderProgressBar("Sisa Larutan Pestisida", sisaPestisida, BugReport)}
            </div> */}
            <div className="grid grid-cols-1 mb-2 sm:grid-cols-4 gap-4  sm:w-[90%] w-full sm:mx-12">
              {renderProgressBar("Sisa Larutan Nutrisi AB", sisaNutrisiAB, Nature)}
              {/* {renderProgressBar("Sisa Larutan pH Up", pHUp, Opacity)} */}
              {renderProgressBar("Sisa Larutan pH Down", pHDown, Opacity)}
              {/* {renderProgressBar("Sisa Larutan Kontainer", sisaKontainer, WaterDrop)} */}
              {renderProgressBar("Sisa Larutan Pupuk Daun", sisaPupukDaun, LocalFlorist)}
              {renderProgressBar("Sisa Larutan Pestisida", sisaPestisida, BugReport)}
              {/* <div>
              {weatherInfo && (
                <Card className="flex flex-col items-center justify-center p-4 mt-4  w-full sm:mx-12 rounded-lg outline outline-2">
                  <p className="font-semibold text-md">Monitoring dan Kontrol Nutrisi</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <Image
                        src={`http://openweathermap.org/img/w/${weatherInfo.weather[0].icon}.png`}
                        alt={weatherInfo.weather[0].description}
                        width={50}
                        height={50}
                      />
                    </div>
                    <div>
                      <Typography variant="subtitle1">{weatherInfo.weather[0].description}</Typography>
                      <Typography variant="body2">{`Suhu: ${weatherInfo.main.temp} °C`}</Typography>
                      <Typography variant="body2">{`Kelembaban: ${weatherInfo.main.humidity}%`}</Typography>
                    </div>
                  </div>
                </Card>
              )}
              </div> */}
               <NutritionControl />
            <PhControl />
            <KualitasAir />
            <Kekeruhan/>
            {/* TAMBAHKAN PEMBUNGKUS DI BAWAH INI */}
            <div className="col-span-1 sm:col-span-4 flex justify-center gap-4">
              <KetinggianAir/>
              <KetinggianAirDua/>
              <AliranAir/>
            </div>          
              <div className="col-span-1 sm:col-span-2">
                {/* <SuhuControl /> */}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-2 w-full sm:w-10/12 mx-auto text-sm mb-8 outline outline-2 rounded-lg mt-4">
            <p className="font-semibold text-base sm:text-xl  pt-4">
              Log Aktivitas
            </p>
            <LogActivity />
          </div>
        </>
    </main>
  );
}
