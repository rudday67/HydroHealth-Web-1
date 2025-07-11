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

export default function PupukDaunControl() {
  const [isPupukDaun, setIsPupukDaun] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pupukValue, setPupukValue] = useState<number>(0);
  const pupukRef = ref(database, "Kontrol_panel/Misting_pupuk");

  useEffect(() => {
    const pupukLevelRef = ref(database, "Sensor/Monitoring/Sisa_pupuk");
    onValue(pupukLevelRef, (snapshot) => {
      const data = snapshot.val();
      setPupukValue(data);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onValue(pupukRef, (snapshot) => {
      setIsPupukDaun(!!snapshot.val());
    });
    return () => unsubscribe();
  }, [pupukRef]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !isPupukDaun;
      await set(pupukRef, newValue);
      setIsPupukDaun(newValue);
    } catch (error) {
      console.error("Error toggling pupuk daun:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-green-200 m-2 w-full sm:w-70 py-2 rounded-lg">
      <h1 className="font-bold text-center text-sm sm:text-base">
        Pupuk Daun
      </h1>
      <div className="flex flex-row gap-6 bg-green-200 p-2 rounded-lg justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 text-sm">
          <p className="text-sm text-center">
            Pupuk Daun dari Misting
          </p>
          <div className="flex flex-col items-center gap-2">
            <Tooltip 
              content={isPupukDaun ? "Matikan pupuk daun" : "Hidupkan pupuk daun"}
              color="foreground"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <Switch
                    isSelected={isPupukDaun}
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
              Sisa Pupuk: {pupukValue} mL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}