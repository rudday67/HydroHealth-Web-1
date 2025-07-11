import { useCallback, useEffect, useState } from "react";
import { Tanaman } from "../models/types";
import {
  getTanamanData,
  addNewTanaman,
  deleteTanaman,
  editTanaman,
  monitorDatabase,
} from "../services/tanamanService";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import AddIcon from "@mui/icons-material/Add";

const formatDateForInput = (date: Date | null) => {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateForDisplay = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())} WITA`;
};

const calculateDaysBetween = (startDate: string, endDate: string) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diff = end - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const AddTanaman = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [tanaman, setTanaman] = useState<Tanaman | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [namaBaru, setNamaBaru] = useState("");
  const [tanggalTanamBaru, setTanggalTanamBaru] = useState("");
  const [tanggalPanenBaru, setTanggalPanenBaru] = useState("");

  const [editedNama, setEditedNama] = useState("");
  const [editedStatus, setEditedStatus] = useState({
    panen: false,
    semai: false,
    tumbuh: false,
  });
  const [editedTanggalTanam, setEditedTanggalTanam] = useState("");
  const [editedTanggalPanen, setEditedTanggalPanen] = useState("");

  const [selectedTanaman, setSelectedTanaman] = useState<string | null>(null);

  const fetchTanaman = async () => {
    setLoading(true);
    try {
      const data = await getTanamanData();
      setTanaman(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTanaman = async () => {
    if (!namaBaru.trim()) {
      alert("Nama tanaman tidak boleh kosong");
      return;
    }
    
    try {
      await addNewTanaman(
        namaBaru,
        tanggalTanamBaru || new Date().toISOString(),
        tanggalPanenBaru
      );
      await fetchTanaman();
      setNamaBaru("");
      setTanggalTanamBaru("");
      setTanggalPanenBaru("");
    } catch (error) {
      console.error("Error adding new plant: ", error);
      alert("Gagal menambahkan tanaman baru");
    }
  };

  const updateUsiaDanEstimasiPanen = useCallback(() => {
    if (!tanaman) return;

    const updatedTanaman = { ...tanaman };

    Object.keys(updatedTanaman.nama_tanaman).forEach((nama) => {
      const tanggalTanam = updatedTanaman.tanggal_tanam[nama];
      const tanggalPanen = updatedTanaman.tanggal_panen[nama];

      if (tanggalTanam) {
        updatedTanaman.usia_tanaman[nama] = String(
          calculateDaysBetween(tanggalTanam, new Date().toISOString())
        );
      }

      if (tanggalPanen) {
        updatedTanaman.estimasi_panen[nama] = String(
          calculateDaysBetween(new Date().toISOString(), tanggalPanen)
        );
      }
    });

    setTanaman(updatedTanaman);
  }, [tanaman]);

  useEffect(() => {
    monitorDatabase();
    fetchTanaman();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateUsiaDanEstimasiPanen();
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [updateUsiaDanEstimasiPanen]);

  const handleDelete = async (nama: string) => {
    try {
      await deleteTanaman(nama);
      await fetchTanaman();
      onClose();
    } catch (error) {
      console.error(`Error deleting ${nama}: `, error);
    }
  };

  const handleEdit = (nama: string) => {
    const selectedStatus = tanaman?.status_pertumbuhan[nama] || {
      panen: false,
      semai: false,
      tumbuh: false,
    };
    const selectedTanggalTanam = tanaman?.tanggal_tanam[nama] || "";
    const selectedTanggalPanen = tanaman?.tanggal_panen[nama] || "";

    setEditedNama(nama);
    setEditedStatus(selectedStatus);
    setEditedTanggalTanam(selectedTanggalTanam);
    setEditedTanggalPanen(selectedTanggalPanen);

    setSelectedTanaman(nama);
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      if (selectedTanaman) {
        await editTanaman(selectedTanaman, {
          ...editedStatus,
          tanggal_tanam: editedTanggalTanam,
          tanggal_panen: editedTanggalPanen,
        });
        await fetchTanaman();
        setSelectedTanaman(null);
        setEditedNama("");
        onClose();
      }
    } catch (error) {
      console.error("Kesalahan saat memperbarui tanaman: ", error);
    }
  };

  const getStatusPertumbuhan = (status: Record<string, boolean>) => {
    if (status.panen) return "panen";
    if (status.tumbuh) return "tumbuh";
    if (status.semai) return "semai";
    return null;
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditedStatus({
      panen: value === "panen",
      semai: value === "semai",
      tumbuh: value === "tumbuh",
    });
  };

  if (loading) return <p>Loading...</p>;

  if (!tanaman) return <p>No data available</p>;

  return (
    <>
      <Table
        aria-label="Daftar Tanaman"
        radius="none"
        bottomContent={
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2 items-center">
              <Input
                isRequired
                radius="sm"
                type="text"
                value={namaBaru}
                onChange={(e) => setNamaBaru(e.target.value)}
                placeholder="Nama Tanaman Baru"
                className="flex-1"
              />
              <Input
                type="datetime-local"
                value={tanggalTanamBaru}
                onChange={(e) => setTanggalTanamBaru(e.target.value)}
                placeholder="Tanggal Tanam"
                className="flex-1"
              />
              <Input
                type="datetime-local"
                value={tanggalPanenBaru}
                onChange={(e) => setTanggalPanenBaru(e.target.value)}
                placeholder="Tanggal Panen"
                className="flex-1"
              />
              <Button
                color="success"
                onClick={handleAddNewTanaman}
                startContent={<AddIcon />}
              >
                Tambah
              </Button>
            </div>
          </div>
        }
        color="default"
        className="overflow-auto rounded-lg"
      >
        <TableHeader>
          <TableColumn>NO</TableColumn>
          <TableColumn>NAMA TANAMAN</TableColumn>
          <TableColumn>STATUS TANAMAN</TableColumn>
          <TableColumn>TANGGAL TANAM</TableColumn>
          <TableColumn>TANGGAL PANEN</TableColumn>
          <TableColumn>USIA TANAMAN</TableColumn>
          <TableColumn>ESTIMASI PANEN</TableColumn>
          <TableColumn>AKSI</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Tidak ada tanaman."}>
          {Object.keys(tanaman.nama_tanaman).map((nama, index) => (
            <TableRow key={nama}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{nama || null}</TableCell>
              <TableCell>
                {getStatusPertumbuhan(tanaman.status_pertumbuhan[nama])}
              </TableCell>
              <TableCell>
                {formatDateForDisplay(tanaman.tanggal_tanam[nama] || null)}
              </TableCell>
              <TableCell>
                {formatDateForDisplay(tanaman.tanggal_panen[nama] || null)}
              </TableCell>
              <TableCell>{tanaman.usia_tanaman[nama] || null} Hari</TableCell>
              <TableCell>{tanaman.estimasi_panen[nama] || null} Hari</TableCell>
              <TableCell>
                <Button
                  onPress={() => handleEdit(nama)}
                  size="sm"
                  color="success"
                  variant="flat"
                  className="p-2 min-w-8 h-8"
                >
                  <TuneIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Pengaturan Tanaman {selectedTanaman}
              </ModalHeader>
              <ModalBody>
                {selectedTanaman && (
                  <div className="flex flex-col gap-2 justify-start ">
                    <Table hideHeader aria-label="table" radius="sm">
                      <TableHeader>
                        <TableColumn className="py-0 px-0">Data</TableColumn>
                        <TableColumn>Space</TableColumn>
                        <TableColumn className="py-0 px-0">Value</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow key="1">
                          <TableCell className="py-0 px-0">
                            Tanggal Tanam
                          </TableCell>
                          <TableCell>:</TableCell>
                          <TableCell>
                            <input
                              className="bg-emerald-100 rounded-lg p-2 ml-2 cursor-pointer uppercase"
                              type="datetime-local"
                              value={formatDateForInput(
                                new Date(editedTanggalTanam)
                              )}
                              onChange={(e) =>
                                setEditedTanggalTanam(e.target.value)
                              }
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow key="2">
                          <TableCell className="py-0 px-0">
                            Tanggal Panen
                          </TableCell>
                          <TableCell>:</TableCell>
                          <TableCell>
                            <input
                              className="bg-emerald-100 rounded-lg p-2 ml-2 cursor-pointer uppercase"
                              type="datetime-local"
                              value={formatDateForInput(
                                new Date(editedTanggalPanen)
                              )}
                              onChange={(e) =>
                                setEditedTanggalPanen(e.target.value)
                              }
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow key="3">
                          <TableCell className="py-0 px-0">
                            Status Tanaman
                          </TableCell>
                          <TableCell>:</TableCell>
                          <TableCell>
                            <select
                              className="bg-emerald-100 rounded-lg p-2 ml-2"
                              value={getStatusPertumbuhan(editedStatus) || ""}
                              onChange={handleStatusChange}
                            >
                              <option value="" disabled>
                                Pilih Status
                              </option>
                              <option className="bg-white" value="semai">
                                Semai
                              </option>
                              <option className="bg-white" value="tumbuh">
                                Tumbuh
                              </option>
                              <option className="bg-white" value="panen">
                                Panen
                              </option>
                            </select>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => handleDelete(selectedTanaman!)}
                  color="danger"
                >
                  Hapus
                </Button>
                <Button onClick={handleUpdate} color="success" variant="flat">
                  Perbarui
                </Button>
                <Button color="primary" variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddTanaman;