// app/monitoring2/page.tsx
"use client";

import { useAuth } from "@/middleware/AuthenticationProviders";
import AlertCheckAuth from "@/components/AlertCheckAuth";
import AlertLoginGuest from "@/components/AlertLoginGuest";
import AlertAuthorizedMember from "@/components/AlertAuthorizedMember";
import React, { useState, useEffect } from "react";
import CombinedChart from "@/components/CombinedChart";

// Anda bisa menambahkan komponen baru untuk halaman ini di sini nanti (test)
// Contoh: import SuhuControl from "@/components/SuhuControl";

export default function Monitoring2() {
  const user = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  

  useEffect(() => {
    if (user) {
      // Sesuaikan role jika perlu
      if (user.role === "admin" || user.role === "member" || user.role === "registered") {
        setIsAuthorized(true);
      }
      setIsCheckingAuth(false);
    } else {
      setIsCheckingAuth(false);
    }
  }, [user]);

  if (isCheckingAuth) {
    return <AlertCheckAuth />;
  }

  if (!user) {
    return <AlertLoginGuest />;
  }

  if (!isAuthorized) {
    return <AlertAuthorizedMember />;
  }

  return (
     <main className="p-4 sm:p-8">
      <CombinedChart />
    </main>
    // <main className="flex flex-col justify-center min-h-screen mx-2 items-center gap-3">
    //     <>
    //       <div className="flex flex-col justify-center items-center">
    //         <div className="text-center mt-12 p-4">
    //           <div>
    //             <p className="text-xl sm:text-3xl font-bold pb-2">
    //               Selamat datang di halaman{" "}
    //               <span className="font-bold text-emerald-500">
    //                 Monitoring Tambahan
    //               </span>
    //               , {user ? user.displayName : ""}👋
    //             </p>
    //             <p className="text-base sm:text-sm font-sm text-gray-700">
    //               Halaman ini untuk menampilkan data sensor lainnya.
    //             </p>
    //           </div>
    //         </div>
    //         {/* Bagian untuk kontrol admin bisa ditambahkan di sini jika perlu */}
    //       </div>

    //       {/* Kerangka untuk kartu-kartu monitoring */}
    //       <div className="flex p-2 border mt-4 rounded-lg justify-center w-full outline outline-2 items-center flex-col">
    //         <p className="font-semibold text-base sm:text-xl py-4">
    //           Monitoring Sensor Lainnya
    //         </p>
    //         <div className="grid grid-cols-1 mb-2 sm:grid-cols-4 gap-4 sm:w-[90%] w-full sm:mx-12">
    //           {/* ANDA BISA MULAI MENAMBAHKAN KOMPONEN MONITORING BARU DI SINI.
    //             Contoh:
    //             <SuhuControl />
    //             <KelembabanControl />
    //           */}
    //           <div className="col-span-full text-center text-gray-500 p-8">
    //             Halaman ini masih dalam pengembangan.
    //           </div>
    //         </div>
    //       </div>
          
    //       {/* Log Aktivitas (opsional, bisa dihapus jika tidak perlu) */}
    //       <div className="flex flex-col justify-center items-center gap-2 w-full sm:w-10/12 mx-auto text-sm mb-8 outline outline-2 rounded-lg mt-4">
    //         <p className="font-semibold text-base sm:text-xl pt-4">
    //           Log Aktivitas
    //         </p>
    //         <LogActivity />
    //       </div>
    //     </>
    // </main>
  );
}