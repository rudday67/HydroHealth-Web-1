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
import Tooltip from '@mui/material/Tooltip';

export default function PelindungControl() {
  const [isPelindungHama, setPelindungHama] = useState(0);
  const pelindungRef = ref(database, "Kontrol_Panel/Pelindung Hama");


  useEffect(() => {
      onValue(pelindungRef, (snapshot) => {
        setPelindungHama(snapshot.val()); // update the local state with the database value
      });
    }, [pelindungRef]);
  
    const handleManualToggle = () => {
      set(pelindungRef, !isPelindungHama); // update the database value when the button is clicked
    };

  return (
    <>
    <Tooltip title="This feature is under maintenance">
    <div className="bg-slate-200 m-2 w-50 sm:w-70 py-2 rounded-lg">
      <h1 className="font-bold text-sm sm:text-base text-center">Pelindung Hama</h1>
      <div className="flex flex-row gap-6 bg-slate-200 p-2 rounded-lg justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2 text-sm">
          <p className="text-sm text-center pb-2">Sistem Pelindung Hama</p>
          
            <span>
              <div className="flex justify-center">
                <Button disabled size="sm" variant="faded" className="text-gray-400">
                {isPelindungHama ? "Hidup" : "Mati"}
              </Button>
          </div>
            </span>
          {/* <div className="flex justify-center">
              <Button size="sm" variant="faded" color="secondary" onPress={handleManualToggle}>
              {isPelindungHama ? "Hidup" : "Mati"}
              </Button>
          </div> */}
        </div>
      </div>
    </div>
    </Tooltip>
    </>
  );
}
