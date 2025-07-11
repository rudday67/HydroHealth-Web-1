"use client";
import * as React from "react";
import { Select, MenuItem, Button } from "@mui/material";
import { useAuth } from "@/middleware/AuthenticationProviders";
import { database } from "../../../firebaseConfig";
import { ref, onValue, set, remove, push } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
} from "@nextui-org/react";
import AlertLoginGuest from "@/components/AlertLoginGuest";
import AlertCheckAuth from "@/components/AlertCheckAuth";
import AlertAuthorizedAdmin from "@/components/AlertAuthorizedAdmin";
import { SearchIcon } from "@/components/SearchIcon";

export default function Admin() {
  const user = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [users, setUsers] = useState<
    {
      uid: string;
      displayName: string;
      email: string;
      role: string;
      lastLogin: number;
      loginTime: number;
      isActive: boolean;
    }[]
  >([]);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [logsAdmin, setLogsAdmin] = useState<
    {
      timestamp: number;
      activity: string;
    }[]
  >([]);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setIsAuthorized(true);
      }
      setIsCheckingAuth(false);
    } else {
      setIsCheckingAuth(false);
    }
  }, [user]);

  const handleChangeRole = (userId: any, newRole: unknown) => {
    const userRef = ref(database, `users/${userId}/role`);
    set(userRef, newRole);
    logActivity(`User role updated for ${userId} to ${newRole}`);
  };

  const handleDeleteUser = (userId: string) => {
    const userRef = ref(database, `users/${userId}`);
    remove(userRef);
    logActivity(`User ${userId} deleted`);
  };

  const logActivity = (activity: string) => {
    const logRef = ref(database, "logsAdmin");
    const newLogRef = push(logRef);
    set(newLogRef, {
      timestamp: Date.now(),
      activity: activity,
    });
  };

  useEffect(() => {
    const usersRef = ref(database, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val() || {};
      const usersList = Object.values(usersData).map((user) => {
        const typedUser = user as {
          uid: string;
          displayName: string;
          email: string;
          role: string;
          lastLogin: number;
          loginTime: number;
          isActive: boolean;
        };
        return {
          ...typedUser,
          role:
            typedUser.role ||
            process.env.NEXT_PUBLIC_VERCEL_DEFAULT_USER_ROLE ||
            "",
        };
      });
      setUsers(usersList);
    });

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
    const logsAdminRef = ref(database, "logsAdmin");

    const unsubscribe = onValue(logsAdminRef, (snapshot) => {
      const logsAdminData = snapshot.val() || {};
      const logsAdminList = Object.values(logsAdminData).map((log) => {
        return log as {
          timestamp: number;
          activity: string;
        };
      });
      setLogsAdmin(logsAdminList.reverse());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const [pageListUser, setPageListUser] = useState(1);
  const rowsPerPageListUser = 5;
  const pagesListUser = Math.ceil(users.length / rowsPerPageListUser);
  const paginatedListUser = React.useMemo(() => {
    const filteredUsers = users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const start = (pageListUser - 1) * rowsPerPageListUser;
    const end = start + rowsPerPageListUser;
    return filteredUsers.slice(start, end);
  }, [pageListUser, users, searchQuery]);

  const [pageListLog, setPageListLog] = useState(1);
  const rowsPerPageListLog = 5;
  const pagesListLog = Math.ceil(logsAdmin.length / rowsPerPageListLog);
  const paginatedListLog = React.useMemo(() => {
    const start = (pageListLog - 1) * rowsPerPageListLog;
    const end = start + rowsPerPageListLog;
    return logsAdmin.slice(start, end);
  }, [pageListLog, logsAdmin]);

  if (isCheckingAuth) {
    return <AlertCheckAuth />;
  }

  if (!user) {
    return <AlertLoginGuest />;
  }

  if (!isAuthorized) {
    return <AlertAuthorizedAdmin />;
  }

  return (
    <main className="flex flex-col justify-center w-full min-h-screen gap-3 p-4">
      <>
        <p className="text-center text-xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-3xl font-bold pb-2 pt-2 sm:pt-8">
          Selamat datang di halaman{" "}
          <span className="font-bold text-emerald-500">
            Admin Page
          </span>
          , {user.displayName}👋
        </p>
        <div className="flex flex-col justify-center items-center gap-2 w-full sm:w-10/12 mx-auto text-sm outline outline-2 rounded-lg mt-2">
          <p className="font-semibold text-base sm:text-xl pt-4">
            Manajemen Pengguna
          </p>
          <Table
            aria-label="Daftar Pengguna"
            radius="none"
            topContent={
              <div className="flex flex-row font-bold justify-between items-center">
                <p>Daftar Pengguna:</p>
                <Input
                  classNames={{
                    base: "max-w-[10rem] h-10",
                    mainWrapper: "h-full",
                    input: "text-small",
                    inputWrapper:
                      "h-full font-normal text-default-500 bg-default-300/20",
                  }}
                  placeholder="Cari Pengguna"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  radius="sm"
                  startContent={<SearchIcon size={18} />}
                  type="search"
                />
              </div>
            }
            color="default"
            className="overflow-auto rounded-lg"
          >
            <TableHeader>
              <TableColumn>NO</TableColumn>
              <TableColumn>NAMA</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>AKSI</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"Tidak ada pengguna."}>
              {paginatedListUser.map((users, index) => (
                <TableRow key={users.uid}>
                  <TableCell>
                    {(pageListUser - 1) * rowsPerPageListUser + index + 1}
                  </TableCell>
                  <TableCell>{users.displayName}</TableCell>
                  <TableCell>{users.email}</TableCell>
                  <TableCell>
                    {user?.uid === users.uid ? (
                      <Select
                        disabled
                        size="small"
                        value={users.role}
                        className="capitalize"
                      >
                        <MenuItem value={users.role}>{users.role}</MenuItem>
                      </Select>
                    ) : (
                      <Select
                        size="small"
                        value={users.role}
                        onChange={(e) =>
                          handleChangeRole(users.uid, e.target.value as string)
                        }
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="member">Member</MenuItem>
                        <MenuItem value="registered">Registered</MenuItem>
                        <MenuItem value="guest">Guest</MenuItem>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {users.isActive ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-red-500">Offline</span>
                    )}  
                  </TableCell>
                  <TableCell>
                    {user?.uid === users.uid ? null : (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => {
                          if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                            handleDeleteUser(users.uid);
                          }
                        }}
                      >
                        Hapus
                      </Button>
                    )}
                  </TableCell>
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
            total={pagesListUser}
            initialPage={pageListUser}
            page={pageListUser}
            onChange={(page) => setPageListUser(page)}
          />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 w-full sm:w-10/12 mx-auto text-sm outline outline-2 rounded-lg mt-6">
          <p className="font-semibold text-base sm:text-xl pt-4">
            Log Aktivitas
          </p>
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
              <TableColumn>WAKTU</TableColumn>
              <TableColumn>AKTIVITAS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"Tidak ada log aktivitas."}>
              {paginatedListLog.map((log, index) => (
                <TableRow key={log.timestamp}>
                  <TableCell>
                    {(pageListLog - 1) * rowsPerPageListLog + index + 1}
                  </TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
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
        </div>
      </>
    </main>
  );
}
