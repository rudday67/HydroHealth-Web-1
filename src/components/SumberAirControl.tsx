"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { database } from "../../firebaseConfig"; // import the database instance
import { ref, onValue, set } from "firebase/database";
import { Tooltip } from "@mui/material";

export default function SumberAir() {
  const [isSelenoidValve, setIsSelenoidValve] = useState(false);
  const valveRef = ref(database, "Kontrol_panel/Peasukan_air");
  
  useEffect(() => {
    onValue(valveRef, (snapshot) => {
      setIsSelenoidValve(snapshot.val()); // update the local state with the database value
    });
  }, [valveRef]);

  const handleManualToggle = () => {
    set(valveRef, !isSelenoidValve); // update the database value when the button is clicked
  };

  return (
    <>
      <Tooltip title="This feature is under maintenance">
        <div className="bg-slate-200 m-2 w-50 sm:w-70 py-2 rounded-lg">
          <h1 className="font-bold text-sm sm:text-base text-center">Sumber Air</h1>
          <div className="flex flex-row gap-6 bg-slate-200 p-2 rounded-lg justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-2 text-sm">
              <p className="text-sm text-center pb-2">Sumber Air dikenadilakn otomatis</p>
              <div className="flex justify-center">
                <Button size="sm" variant="faded" color="secondary" onPress={handleManualToggle}>
                  {isSelenoidValve ? "Hidup" : "Mati"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Tooltip>
    </>
  );
}
