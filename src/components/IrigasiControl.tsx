"use client";
import * as React from "react";
import {
  Switch,
  Tooltip,
  Spinner
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { database } from "../../firebaseConfig";
import { ref, onValue, set } from "firebase/database";

// 1. Nama komponen diubah
export default function PompaIrigasiControl() {
  // 2. Variabel state diubah namanya
  const [isPompaIrigasi, setIsPompaIrigasi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Path Firebase diubah
  const pompaRef = ref(database, "Kontrol_Panel/pompa_irigasi");

  useEffect(() => {
    // Listener untuk status pompa irigasi
    const unsubscribe = onValue(pompaRef, (snapshot) => {
      setIsPompaIrigasi(!!snapshot.val());
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !isPompaIrigasi;
      await set(pompaRef, newValue);
    } catch (error) {
      console.error("Error toggling pompa irigasi:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-200 m-2 w-full sm:w-70 py-2 rounded-lg">
      <h1 className="font-bold text-center text-sm sm:text-base">
        Pompa Irigasi
      </h1>
      <div className="flex flex-row gap-6 bg-green-200 p-2 rounded-lg justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 text-sm">
          <p className="text-sm text-center">
            Mengalirkan Air Nutrisi ke Tanaman
          </p>
          <div className="flex flex-col items-center gap-2">
            <Tooltip 
              content={isPompaIrigasi ? "Matikan Pompa Irigasi" : "Hidupkan Pompa Irigasi"}
              color="foreground"
            >
              <div className="flex items-center gap-2 h-8">
                {isLoading ? (
                  <Spinner size="sm" color="success" />
                ) : (
                  <Switch
                    isSelected={isPompaIrigasi}
                    onValueChange={handleToggle}
                    color="success"
                  />
                )}
              </div>
            </Tooltip>
             {/* 4. Tampilan Sisa Pupuk dihapus */}
          </div>
        </div>
      </div>
    </div>
  );
}