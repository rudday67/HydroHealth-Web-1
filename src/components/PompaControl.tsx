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
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { database } from "../../firebaseConfig"; // import the database instance
import { ref, onValue, set } from "firebase/database";


export default function PompaControl () {
    const [isPompaValue, setPompaValue] = useState(0);
  const pompaRef = ref(database, "Kontrol_panel/Pompa_air");


    useEffect(() => {
        onValue(pompaRef, (snapshot) => {
          setPompaValue(snapshot.val()); // update the local state with the database value
        });
      }, [pompaRef]);
    
      const handleManualToggle = () => {
        set(pompaRef, !isPompaValue); // update the database value when the button is clicked
      };

    return (
        <div className="bg-green-200 m-2 w-50 sm:w-70 py-2 rounded-lg">
            <h1 className="font-bold text-center text-sm sm:text-base">Pompa Utama</h1>
            <div className="flex flex-row gap-6  bg-green-200 p-2 rounded-lg justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-2 text-sm">
                <p className="text-sm text-center pb-2">Pompa dari Kontainer ke Pipa</p>
                <div className="flex justify-center">
                <Button size="sm" variant="faded" color="secondary" onPress={handleManualToggle}>
                {isPompaValue ? "Hidup" : "Mati"}
                </Button>
            </div>
            </div>
            </div> 
        </div>
    );
}