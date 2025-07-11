import * as React from "react";
import { useAuth } from "@/middleware/AuthenticationProviders";
import { database } from "../../firebaseConfig";
import { ref, onValue, push, set, off } from "firebase/database";
import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@nextui-org/react";

interface LogData {
  key: string;
  uid: string;
  displayName: string;
  timestamp: number;
  activity: string;
}

export default function LogActivity() {
  const auth = useAuth();

  const [logAktivitasMember, setAktivitasMember] = useState<LogData[]>([]);
  const listenersRef = useRef<{ [key: string]: boolean }>({});
  const lastValuesRef = useRef<{ [key: string]: any }>({});
  const initialLoadRef = useRef<{ [key: string]: boolean }>({});

  const logAktivitas = (activity: string) => {
    if (!auth?.uid) {
      console.error("User not authenticated");
      return;
    }

    const logRef = ref(database, "Log_Aktivitas_Member");
    const newLogRef = push(logRef);
    const newLog: LogData = {
      key: newLogRef.key ?? '', // Gunakan key yang dihasilkan oleh Firebase
      uid: auth.uid,
      displayName: auth.displayName ?? "",
      timestamp: Date.now(),
      activity: activity,
    };

    set(newLogRef, newLog);
  };

  const handleControlUpdate = (controlName: string) => {
    const controlRef = ref(database, `Kontrol_Panel/${controlName}`);
    if (!listenersRef.current[controlName]) {
      onValue(controlRef, (snapshot) => {
        const newValue = snapshot.val();
        // Check if it's the initial load
        if (!initialLoadRef.current[controlName]) {
          initialLoadRef.current[controlName] = true;
        } else if (lastValuesRef.current[controlName] !== newValue) {
          lastValuesRef.current[controlName] = newValue;
          logAktivitas(`Mengubah ${controlName} ke ${newValue ? "Hidup" : "Mati"}`);
        }
      });
      listenersRef.current[controlName] = true;
    }
  };

  useEffect(() => {
    if (!auth) return;

    handleControlUpdate("Misting Pestisida");
    handleControlUpdate("Misting Pupuk Daun");
    handleControlUpdate("Pelindung Hama");
    handleControlUpdate("Pemasukan ke Kontainer");
    handleControlUpdate("Pembuangan Pipa Hidroponik");
    handleControlUpdate("Pembuangan ke Kontainer");
    handleControlUpdate("Pengaduk Larutan");
    handleControlUpdate("Pompa Utama");

    // Cleanup listeners on unmount
    return () => {
      off(ref(database, "Kontrol_Panel/Misting Pestisida"));
      off(ref(database, "Kontrol_Panel/Misting Pupuk Daun"));
      off(ref(database, "Kontrol_Panel/Pelindung Hama"));
      off(ref(database, "Kontrol_Panel/Pemasukan ke Kontainer"));
      off(ref(database, "Kontrol_Panel/Pembuangan Pipa Hidroponik"));
      off(ref(database, "Kontrol_Panel/Pembuangan ke Kontainer"));
      off(ref(database, "Kontrol_Panel/Pengaduk Larutan"));
      off(ref(database, "Kontrol_Panel/Pompa Utama"));
      listenersRef.current = {};
      initialLoadRef.current = {};
    };
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    const logRef = ref(database, "Log_Aktivitas_Member");
    const unsubscribe = onValue(logRef, (snapshot) => {
      const logsData = snapshot.val() || {};
      const logsList = Object.entries(logsData).map(([key, log]) => {
        const logEntry = log as {
          uid: string;
          displayName: string;
          timestamp: number;
          activity: string;
        };
        return {
          key,
          uid: logEntry.uid,
          displayName: logEntry.displayName,
          timestamp: logEntry.timestamp,
          activity: logEntry.activity,
        };
      });
      setAktivitasMember(logsList.reverse());
    });
    return () => {
      unsubscribe();
    };
  }, [auth]);

  const [pageListLog, setPageListLog] = useState(1);
  const rowsPerPageListLog = 5;
  const pagesListLog = Math.ceil(logAktivitasMember.length / rowsPerPageListLog);
  const paginatedListLog = React.useMemo(() => {
    const start = (pageListLog - 1) * rowsPerPageListLog;
    const end = start + rowsPerPageListLog;
    return logAktivitasMember.slice(start, end);
  }, [pageListLog, logAktivitasMember]);

  return (
    <>
      <Table
        aria-label="Log Aktivitas"
        radius="none"
        topContent={
          <div className="flex flex-row font-bold justify-between items-center">
            <p>Log Aktivitas:</p>
          </div>
        }
        color="default"
        className="overflow-auto rounded-lg"
      >
        <TableHeader>
          <TableColumn>NO</TableColumn>
          <TableColumn>NAMA</TableColumn>
          <TableColumn>WAKTU</TableColumn>
          <TableColumn>AKTIVITAS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Tidak ada log aktivitas."}>
          {paginatedListLog.map((log, index) => (
            <TableRow key={log.key}>
              <TableCell>
                {(pageListLog - 1) * rowsPerPageListLog + index + 1}
              </TableCell>
              <TableCell>{log.displayName}</TableCell>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.activity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mb-4">
        <Pagination
          isCompact
          size="sm"
          showControls
          color="success"
          variant="flat"
          total={pagesListLog}
          initialPage={pageListLog}
          page={pageListLog}
          onChange={(page) => setPageListLog(page)}
        />
      </div>
    </>
  );
}
