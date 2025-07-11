import { getDatabase, ref, get, update, set, onValue } from "firebase/database";
import { Tanaman } from "../models/types";
import { database } from "../../firebaseConfig";

// Helper functions for date calculations
const calculateUsiaTanaman = (tanggalTanam: string): string => {
  const tanamDate = new Date(tanggalTanam);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - tanamDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays.toString();
};

const calculateEstimasiPanen = (
  tanggalTanam: string,
  tanggalPanen: string
): string => {
  const tanamDate = new Date(tanggalTanam);
  const panenDate = new Date(tanggalPanen);
  const now = new Date();
  const diffTime = panenDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays.toString() : "0";
};

// Data operations
const getTanamanData = async (): Promise<Tanaman> => {
  const tanamanRef = ref(database, "settings/tanaman");
  const snapshot = await get(tanamanRef);
  if (snapshot.exists()) {
    return snapshot.val() as Tanaman;
  }
  throw new Error("No data available");
};

const updateTanamanData = async (newData: Partial<Tanaman>) => {
  const tanamanRef = ref(database, "settings/tanaman");
  await update(tanamanRef, newData);
};

const addNewTanaman = async (
  namaBaru: string,
  tanggalTanamBaru: string,
  tanggalPanenBaru: string
) => {
  try {
    if (!namaBaru.trim()) {
      throw new Error("Nama tanaman tidak boleh kosong");
    }

    const tanaman = await getTanamanData();
    
    // Validate if plant already exists
    if (tanaman.nama_tanaman[namaBaru]) {
      throw new Error(`Tanaman ${namaBaru} sudah ada`);
    }

    // Set default status to "semai" if not provided
    const defaultStatus = {
      panen: false,
      semai: true,
      tumbuh: false,
    };

    // Use current time if planting date not provided
    const plantingDate = tanggalTanamBaru || new Date().toISOString();

    tanaman.nama_tanaman[namaBaru] = true;
    tanaman.status_pertumbuhan[namaBaru] = defaultStatus;
    tanaman.tanggal_panen[namaBaru] = tanggalPanenBaru;
    tanaman.tanggal_tanam[namaBaru] = plantingDate;
    tanaman.usia_tanaman[namaBaru] = calculateUsiaTanaman(plantingDate);
    tanaman.estimasi_panen[namaBaru] = calculateEstimasiPanen(
      plantingDate,
      tanggalPanenBaru
    );

    await updateTanamanData(tanaman);
    return { success: true, message: "Tanaman berhasil ditambahkan" };
  } catch (error) {
    console.error("Error adding new plant: ", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal menambahkan tanaman" 
    };
  }
};

const deleteTanaman = async (namaTanaman: string) => {
  try {
    const tanamanRef = ref(database, `settings/tanaman`);
    const snapshot = await get(tanamanRef);
    
    if (!snapshot.exists()) {
      throw new Error("Data tanaman tidak ditemukan");
    }

    const data = snapshot.val() as Tanaman;
    
    if (!data.nama_tanaman[namaTanaman]) {
      throw new Error(`Tanaman ${namaTanaman} tidak ditemukan`);
    }

    // Create updated data without the deleted plant
    const updatedData: Tanaman = {
      nama_tanaman: { ...data.nama_tanaman },
      status_pertumbuhan: { ...data.status_pertumbuhan },
      tanggal_panen: { ...data.tanggal_panen },
      tanggal_tanam: { ...data.tanggal_tanam },
      usia_tanaman: { ...data.usia_tanaman },
      estimasi_panen: { ...data.estimasi_panen },
    };

    delete updatedData.nama_tanaman[namaTanaman];
    delete updatedData.status_pertumbuhan[namaTanaman];
    delete updatedData.tanggal_panen[namaTanaman];
    delete updatedData.tanggal_tanam[namaTanaman];
    delete updatedData.usia_tanaman[namaTanaman];
    delete updatedData.estimasi_panen[namaTanaman];

    await updateTanamanData(updatedData);
    return { success: true, message: "Tanaman berhasil dihapus" };
  } catch (error) {
    console.error(`Error deleting plant ${namaTanaman}: `, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal menghapus tanaman" 
    };
  }
};

const editTanaman = async (
  namaTanaman: string,
  updatedData: {
    status?: {
      panen?: boolean;
      semai?: boolean;
      tumbuh?: boolean;
    };
    tanggal_panen?: string;
    tanggal_tanam?: string;
  }
) => {
  try {
    const tanaman = await getTanamanData();
    
    if (!tanaman.nama_tanaman[namaTanaman]) {
      throw new Error(`Tanaman ${namaTanaman} tidak ditemukan`);
    }

    // Update status if provided
    if (updatedData.status) {
      tanaman.status_pertumbuhan[namaTanaman] = {
        ...tanaman.status_pertumbuhan[namaTanaman],
        ...updatedData.status,
      };
    }

    // Update harvest date if provided
    if (updatedData.tanggal_panen !== undefined) {
      tanaman.tanggal_panen[namaTanaman] = updatedData.tanggal_panen;
    }

    // Update planting date if provided
    if (updatedData.tanggal_tanam !== undefined) {
      const newTanggalTanam = updatedData.tanggal_tanam;
      tanaman.tanggal_tanam[namaTanaman] = newTanggalTanam;
      tanaman.usia_tanaman[namaTanaman] = calculateUsiaTanaman(newTanggalTanam);
      
      // Recalculate harvest estimate
      tanaman.estimasi_panen[namaTanaman] = calculateEstimasiPanen(
        newTanggalTanam,
        updatedData.tanggal_panen || tanaman.tanggal_panen[namaTanaman]
      );
    }

    await updateTanamanData(tanaman);
    return { success: true, message: "Tanaman berhasil diperbarui" };
  } catch (error) {
    console.error(`Error editing plant ${namaTanaman}: `, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal memperbarui tanaman" 
    };
  }
};

// Database initialization and monitoring
const addDefaultDataIfEmpty = async () => {
  try {
    const tanamanRef = ref(database, "settings/tanaman");
    const snapshot = await get(tanamanRef);
    
    if (!snapshot.exists()) {
      const defaultData: Tanaman = {
        nama_tanaman: {},
        status_pertumbuhan: {},
        tanggal_panen: {},
        tanggal_tanam: {},
        usia_tanaman: {},
        estimasi_panen: {},
      };

      // Add sample plants
      const samplePlants = [
        {
          name: "Cabai",
          harvestDays: 90,
          status: { semai: true, tumbuh: false, panen: false }
        },
        {
          name: "Selada",
          harvestDays: 60,
          status: { semai: true, tumbuh: false, panen: false }
        }
      ];

      for (const plant of samplePlants) {
        const panenDate = new Date();
        panenDate.setDate(panenDate.getDate() + plant.harvestDays);
        const tanamDate = new Date().toISOString();

        defaultData.nama_tanaman[plant.name] = true;
        defaultData.status_pertumbuhan[plant.name] = plant.status;
        defaultData.tanggal_panen[plant.name] = panenDate.toISOString();
        defaultData.tanggal_tanam[plant.name] = tanamDate;
        defaultData.usia_tanaman[plant.name] = calculateUsiaTanaman(tanamDate);
        defaultData.estimasi_panen[plant.name] = calculateEstimasiPanen(
          tanamDate,
          panenDate.toISOString()
        );
      }

      await set(tanamanRef, defaultData);
    }
  } catch (error) {
    console.error("Error initializing default data: ", error);
  }
};

const monitorDatabase = () => {
  const tanamanRef = ref(database, "settings/tanaman");
  onValue(tanamanRef, (snapshot) => {
    if (!snapshot.exists()) {
      addDefaultDataIfEmpty().catch(console.error);
    }
  });
};

// Daily update scheduler
const scheduleDailyUpdate = () => {
  const updateData = async () => {
    try {
      const tanaman = await getTanamanData();
      const now = new Date();
      
      for (const namaTanaman in tanaman.nama_tanaman) {
        const tanggalTanam = tanaman.tanggal_tanam[namaTanaman];
        const tanggalPanen = tanaman.tanggal_panen[namaTanaman];
        
        tanaman.usia_tanaman[namaTanaman] = calculateUsiaTanaman(tanggalTanam);
        tanaman.estimasi_panen[namaTanaman] = calculateEstimasiPanen(
          tanggalTanam,
          tanggalPanen
        );

        // Auto-update status based on dates
        const daysToHarvest = parseInt(tanaman.estimasi_panen[namaTanaman]);
        const currentStatus = tanaman.status_pertumbuhan[namaTanaman];
        
        if (!currentStatus.panen) {
          if (daysToHarvest <= 0) {
            tanaman.status_pertumbuhan[namaTanaman] = {
              panen: true,
              semai: false,
              tumbuh: false
            };
          } else if (daysToHarvest <= 30) {
            tanaman.status_pertumbuhan[namaTanaman] = {
              panen: false,
              semai: false,
              tumbuh: true
            };
          }
        }
      }

      await updateTanamanData(tanaman);
    } catch (error) {
      console.error("Error during daily update: ", error);
    }
  };

  // Initial scheduling
  const now = new Date();
  const msUntilMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0
  ).getTime() - now.getTime();

  setTimeout(() => {
    updateData();
    setInterval(updateData, 24 * 60 * 60 * 1000); // Daily updates
  }, msUntilMidnight);
};

// Initialize
monitorDatabase();
scheduleDailyUpdate();

export {
  getTanamanData,
  updateTanamanData,
  addNewTanaman,
  deleteTanaman,
  editTanaman,
  addDefaultDataIfEmpty,
  monitorDatabase,
  scheduleDailyUpdate,
};