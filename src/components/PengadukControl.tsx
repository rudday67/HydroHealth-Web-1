"use client";
import * as React from "react";
import {
  Button,
  Input,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Spinner
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { database } from "../../firebaseConfig";
import { ref, onValue, set } from "firebase/database";

export default function PengadukControl() {
  const [isPengadukKontainer, setPengadukKontainer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [larutanValue, setLarutanValue] = useState<number>(0);
  const pengadukRef = ref(database, "Kontrol_panel/Pengaduk_larutan");

  useEffect(() => {
    const larutanRef = ref(database, "Sensor/Monitoring/Sisa Larutan Kontainer");
    onValue(larutanRef, (snapshot) => {
      const data = snapshot.val();
      setLarutanValue(data);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onValue(pengadukRef, (snapshot) => {
      setPengadukKontainer(!!snapshot.val());
    });
    return () => unsubscribe();
  }, [pengadukRef]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !isPengadukKontainer;
      await set(pengadukRef, newValue);
      setPengadukKontainer(newValue);
    } catch (error) {
      console.error("Error toggling pengaduk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-200 m-2 w-full sm:w-70 py-2 rounded-lg">
      <h1 className="font-bold text-center text-sm sm:text-base">
        Pengaduk Kontainer Larutan
      </h1>
      <div className="flex flex-row gap-6 bg-green-200 p-2 rounded-lg justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 text-sm">
          <p className="text-sm text-center">
            Pengaduk untuk Larutan dalam Kontainer
          </p>
          <div className="flex flex-col items-center gap-2">
            <Tooltip 
              content={isPengadukKontainer ? "Matikan pengaduk" : "Hidupkan pengaduk"}
              color="foreground"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <Switch
                    isSelected={isPengadukKontainer}
                    onValueChange={handleToggle}
                    color="success"
                    thumbIcon={({ isSelected, className }) =>
                      isSelected ? (
                        <span className="text-xs"></span>
                      ) : (
                        <span className="text-xs"></span>
                      )
                    }
                  />
                )}
              </div>
            </Tooltip>
            <p className="text-xs text-gray-600">
              Sisa Larutan: {larutanValue} mL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}