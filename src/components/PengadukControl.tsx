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

export default function PengadukControl() {
  const [isPengadukKontainer, setPengadukKontainer] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Diubah jadi true agar loading tampil di awal

  // 1. Path Firebase diubah sesuai dengan struktur baru Anda
  const pengadukRef = ref(database, "Kontrol_Panel/pompa_pengaduk");

  useEffect(() => {
    const unsubscribe = onValue(pengadukRef, (snapshot) => {
      setPengadukKontainer(!!snapshot.val());
      setIsLoading(false); // Matikan loading setelah data pertama diterima
    });
    return () => unsubscribe();
  }, []); // Dependensi array dikosongkan agar listener hanya dibuat sekali

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !isPengadukKontainer;
      await set(pengadukRef, newValue);
      // State akan otomatis terupdate oleh listener onValue, 
      // jadi baris setPengadukKontainer(newValue) bisa dihilangkan
      // untuk memastikan data sinkron dengan Firebase.
    } catch (error) {
      console.error("Error toggling pengaduk:", error);
      // Kembalikan state jika gagal untuk UX yang lebih baik
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-200 m-2 w-full sm:w-70 py-2 rounded-lg">
      <h1 className="font-bold text-center text-sm sm:text-base">
        Pompa Pengaduk 
      </h1>
      <div className="flex flex-row gap-6 bg-green-200 p-2 rounded-lg justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 text-sm">
          <p className="text-sm text-center">
            Mengaduk Air Larutan di Kontainer
          </p>
          <div className="flex flex-col items-center gap-2">
            <Tooltip 
              content={isPengadukKontainer ? "Matikan pengaduk" : "Hidupkan pengaduk"}
              color="foreground"
            >
              <div className="flex items-center gap-2 h-8"> {/* Memberi tinggi agar layout stabil */}
                {isLoading ? (
                  <Spinner size="sm" color="success" />
                ) : (
                  <Switch
                    isSelected={isPengadukKontainer}
                    onValueChange={handleToggle}
                    color="success"
                  />
                )}
              </div>
            </Tooltip>
            {/* 2. Tampilan Sisa Larutan dihapus sementara */}
          </div>
        </div>
      </div>
    </div>
  );
}