import { Chart } from "chart.js/auto";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import * as XLSX from "xlsx";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import React, { useRef, useState, useEffect } from "react";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TuneIcon from "@mui/icons-material/Tune";
import "chartjs-adapter-moment";
import moment from "moment";

// Nama komponen diubah menjadi TurbidityControl
export default function TurbidityControl() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  // State diubah untuk turbidity
  const [chartData, setChartData] = useState<{ turbidity: number[] }>({ turbidity: [] });
  const [labels, setLabels] = useState<string[]>([]);
  const [turbidityValue, setTurbidityValue] = useState<number>(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [timestamp, setTimestamp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>("1d");
  const [historyData, setHistoryData] = useState<{timestamp: string, value: number}[]>([]);

  useEffect(() => {
    if (!database) {
      setError("Firebase Database not initialized");
      setIsLoading(false);
      return;
    }

    const esp32Ref = ref(database, "esp32info");
    console.log("Subscribing to Turbidity data from:", esp32Ref.toString());

    const unsubscribe = onValue(esp32Ref, (snapshot) => {
      try {
        const allData = snapshot.val();
        console.log("Full Turbidity data structure:", allData);

        if (!allData) {
          setError("No data available under /esp32info");
          setIsLoading(false);
          return;
        }

        // Variabel lokal diubah untuk turbidity
        const turbidityChart: number[] = [];
        const newLabels: string[] = [];
        const newHistoryData: {timestamp: string, value: number}[] = [];

        // Loop untuk mengumpulkan data Kekeruhan (Turbidity)
        Object.keys(allData).sort().forEach(date => {
          Object.keys(allData[date]).sort().forEach(time => {
            // **PENTING**: Pastikan nama field di Firebase Anda adalah 'sensor_kekeruhan'
            if (allData[date][time].sensor_kekeruhan) {
              const timestamp = `${date} ${time}`;
              const value = parseFloat(allData[date][time].sensor_kekeruhan); // Gunakan parseFloat untuk nilai desimal
              
              newLabels.push(timestamp);
              turbidityChart.push(value);
              newHistoryData.push({timestamp, value});
            }
          });
        });

        const filteredLabels = filterLabels(newLabels, timeRange);
        const newLabelsLimited = filteredLabels.slice(-30);
        // Data turbidity yang difilter
        const filteredTurbidity = filterData(turbidityChart, newLabels, newLabelsLimited);

        if (turbidityChart.length > 0) {
          const latestValue = turbidityChart[turbidityChart.length - 1];
          setTurbidityValue(latestValue);
          setTimestamp(newLabels[newLabels.length - 1]);
        }

        // Update state chart dengan data turbidity
        setChartData({ turbidity: filteredTurbidity });
        setLabels(newLabelsLimited);
        setHistoryData(newHistoryData.reverse());
        setError("");

      } catch (error) {
        console.error("Turbidity data processing error:", error);
        setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    }, (error) => {
      console.error("Firebase read error:", error);
      setError(`Connection error: ${error.message}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database, timeRange]);

  const filterLabels = (labels: string[], range: string) => {
    const now = moment();
    let cutoffDate = now.clone();
    
    switch (range) {
      case "1d": cutoffDate.subtract(1, 'days'); break;
      case "7d": cutoffDate.subtract(7, 'days'); break;
      case "1m": cutoffDate.subtract(1, 'months'); break;
      default: cutoffDate.subtract(1, 'days');
    }

    return labels.filter(label => moment(label, "YYYY-MM-DD HH:mm").isSameOrAfter(cutoffDate));
  };

  const filterData = (data: number[], originalLabels: string[], filteredLabels: string[]) => {
    return originalLabels.reduce((acc, label, index) => {
      if (filteredLabels.includes(label)) {
        acc.push(data[index]);
      }
      return acc;
    }, [] as number[]);
  };

  useEffect(() => {
    // Kondisi diubah untuk mengecek data turbidity
    if (isOpen && chartRef.current && chartData.turbidity.length > 0) {
      if ((chartRef.current as any).chart) {
        (chartRef.current as any).chart.destroy();
      }

      const context = chartRef.current.getContext("2d");
      if (context) {
        (chartRef.current as any).chart = new Chart(context, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                // Label diubah untuk Kekeruhan
                label: "Kekeruhan (NTU)",
                data: chartData.turbidity, // Data dari state turbidity
                backgroundColor: "rgba(139, 69, 19, 0.2)", // Warna coklat-transparan
                borderColor: "rgba(139, 69, 19, 1)", // Warna coklat
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: "category",
                ticks: { maxRotation: 45, minRotation: 45 }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  // Teks sumbu Y diubah
                  text: 'Nilai Kekeruhan (NTU)'
                }
              },
            },
          },
        });
      }
    }
  }, [isOpen, chartData, labels]);

  const handleDownloadPNG = () => {
    if (chartRef.current) {
      const file = chartRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      // Nama file download diubah
      link.download = "kekeruhanLineChart.png";
      link.click();
    }
  };

  const handleDownloadExcel = () => {
    const data = [
      // Header Excel diubah
      ["Waktu", "Kekeruhan (NTU)"],
      ...labels.map((label, index) => [label, chartData.turbidity[index]])
    ];
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // Nama sheet diubah
    XLSX.utils.book_append_sheet(workbook, worksheet, "SheetKekeruhan");
    // Nama file Excel diubah
    XLSX.writeFile(workbook, "LineChartKekeruhan.xlsx");
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Kondisi normal untuk kekeruhan (contoh: < 5 NTU)
  const isNormal = turbidityValue < 5;

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        {/* Judul diubah */}
        <h1 className="text-2xl font-bold">Kekeruhan Air</h1>
        <p className="text-gray-600">Nephelometric Turbidity Units (Normal: &lt; 5 NTU)</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Gauge
              value={turbidityValue}
              valueMin={0}
              // valueMax disesuaikan untuk rentang NTU yang lebih kecil
              valueMax={50}
              width={200}
              height={200}
              sx={{
                [`& .${gaugeClasses.valueArc}`]: {
                  // Warna hijau jika jernih, merah jika keruh
                  fill: isNormal ? '#4CAF50' : '#F44336',
                },
              }}
            />
          </div>

          <div className="space-y-2">
            <Chip 
              color={isNormal ? 'success' : 'danger'}
              variant="flat"
              size="lg"
            >
              {/* Teks status diubah */}
              {isNormal ? 'Jernih' : 'Keruh'}
            </Chip>
            {/* Satuan diubah menjadi NTU */}
            <p className="text-2xl font-bold">{turbidityValue.toFixed(2)} NTU</p>
            <p className="text-sm text-gray-600">Terakhir diperbarui: {timestamp}</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onPress={onOpen} color="primary" className="mt-4">
              Lihat Riwayat
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} placement="center" backdrop="blur" onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              {/* Judul modal diubah */}
              <ModalHeader className="flex flex-col gap-1">Riwayat Kekeruhan</ModalHeader>
              <ModalBody className="w-full">
                <div style={{ padding: "16px" }} className="flex flex-col">
                  <div className="flex flex-row justify-end items-center">
                    <Dropdown backdrop="transparent" radius="sm" className="p-1 mb-4">
                      <DropdownTrigger>
                        <Button variant="flat" color="success" size="sm" radius="sm">
                          <TuneIcon />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Filter Time Range">
                        <DropdownItem onClick={() => handleTimeRangeChange("1d")} key="1d">1 Hari</DropdownItem>
                        <DropdownItem onClick={() => handleTimeRangeChange("7d")} key="7d">7 Hari</DropdownItem>
                        <DropdownItem onClick={() => handleTimeRangeChange("1m")} key="1m">1 Bulan</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div>
                    <canvas ref={chartRef} />
                  </div>
                  <div className="mt-6 flex justify-center items-center w-full">
                    <Dropdown backdrop="opaque" radius="sm" className="p-2">
                      <DropdownTrigger>
                        <Button variant="flat" color="success" size="sm" radius="sm">
                          Download Chart
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Actions">
                        <DropdownItem
                          onClick={handleDownloadPNG}
                          startContent={<ImageOutlinedIcon fontSize="small" />}
                          key="png"
                        >
                          Gambar (.png)
                        </DropdownItem>
                        <DropdownItem
                          onClick={handleDownloadExcel}
                          startContent={<InsertDriveFileIcon fontSize="small" />}
                          key="excel"
                        >
                          Excel (.xlsx)
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}