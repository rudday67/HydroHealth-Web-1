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

export default function PestisidaControl() {
  const [isPestisida, setIsPestisida] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pestisidaValue, setPestisidaValue] = useState<number>(0);
  const pestisidaRef = ref(database, "Kontrol_panel/Misting_pestisida");

  useEffect(() => {
    const pestisidaLevelRef = ref(database, "Sensor/Monitoring/Sisa Pestisida");
    onValue(pestisidaLevelRef, (snapshot) => {
      const data = snapshot.val();
      setPestisidaValue(data);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onValue(pestisidaRef, (snapshot) => {
      setIsPestisida(!!snapshot.val());
    });
    return () => unsubscribe();
  }, [pestisidaRef]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !isPestisida;
      await set(pestisidaRef, newValue);
      setIsPestisida(newValue);
    } catch (error) {
      console.error("Error toggling pestisida:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-200 m-2 w-full sm:w-70 py-2 rounded-lg">
      <h1 className="font-bold text-center text-sm sm:text-base">
        Pestisida
      </h1>
      <div className="flex flex-row gap-6 bg-green-200 p-2 rounded-lg justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 text-sm">
          <p className="text-sm text-center">
            Pestisida dari Misting
          </p>
          <div className="flex flex-col items-center gap-2">
            <Tooltip 
              content={isPestisida ? "Matikan pestisida" : "Hidupkan pestisida"}
              color="foreground"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <Switch
                    isSelected={isPestisida}
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
              Sisa Pestisida: {pestisidaValue} mL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}