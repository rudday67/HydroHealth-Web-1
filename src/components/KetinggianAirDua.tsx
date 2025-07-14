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

// 1. Nama komponen diubah menjadi Level2Control
export default function Level2Control() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  // 2. State dan variabel diubah menjadi 'level'
  const [chartData, setChartData] = useState<{ level: number[] }>({ level: [] });
  const [labels, setLabels] = useState<string[]>([]);
  const [levelValue, setLevelValue] = useState<number>(0);
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

    // Path diubah ke "Hydroponic_Data"
    const dataRef = ref(database, "Hydroponic_Data");
    console.log("Subscribing to Level 2 data from:", dataRef.toString());

    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const allData = snapshot.val();
        if (!allData) {
          setError("No data available under /Hydroponic_Data");
          setIsLoading(false);
          return;
        }

        const levelChart: number[] = [];
        const newLabels: string[] = [];
        const newHistoryData: {timestamp: string, value: number}[] = [];

        Object.keys(allData).sort().forEach(date => {
          Object.keys(allData[date]).sort().forEach(id => {
            const entry = allData[date][id];
            
            // 3. Ambil data dari field 'level2_percent'
            if (entry && typeof entry.level2_percent !== 'undefined') {
              const timestamp = entry.timestamp_iso || `${date} ${id.replace('-', ':')}`;
              const value = parseFloat(entry.level2_percent);
              
              if (!isNaN(value)) {
                newLabels.push(timestamp);
                levelChart.push(value);
                newHistoryData.push({timestamp, value});
              }
            }
          });
        });

        const filteredLabels = filterLabels(newLabels, timeRange);
        const newLabelsLimited = filteredLabels.slice(-30);
        const filteredLevel = filterData(levelChart, newLabels, newLabelsLimited);

        if (newLabels.length > 0) {
          const latestValue = levelChart[levelChart.length - 1];
          const latestTimestamp = moment(newLabels[newLabels.length - 1]).format('YYYY-MM-DD HH:mm:ss');
          setLevelValue(latestValue);
          setTimestamp(latestTimestamp);
        }

        setChartData({ level: filteredLevel });
        setLabels(newLabelsLimited);
        setHistoryData(newHistoryData.reverse());
        setError("");

      } catch (error) {
        console.error("Level 2 data processing error:", error);
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
  }, [timeRange]);

  const filterLabels = (labels: string[], range: string) => {
    // Example implementation: filter by time range
    if (range === "1d") {
      const cutoff = moment().subtract(1, "days");
      return labels.filter(label => moment(label).isAfter(cutoff));
    }
    if (range === "7d") {
      const cutoff = moment().subtract(7, "days");
      return labels.filter(label => moment(label).isAfter(cutoff));
    }
    if (range === "1m") {
      const cutoff = moment().subtract(1, "months");
      return labels.filter(label => moment(label).isAfter(cutoff));
    }
    return labels;
  };
  const filterData = (data: number[], originalLabels: string[], filteredLabels: string[]) => {
    // Example implementation: filter data to match filteredLabels
    return originalLabels
      .map((label, idx) => ({ label, value: data[idx] }))
      .filter(item => filteredLabels.includes(item.label))
      .map(item => item.value);
  };

  useEffect(() => {
    if (isOpen && chartRef.current && chartData.level.length > 0) {
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
                label: "Level 2 (%)", // Label diubah
                data: chartData.level,
                backgroundColor: "rgba(255, 206, 86, 0.2)", // Warna diubah
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: { type: 'time', time: { unit: 'hour', tooltipFormat: 'YYYY-MM-DD HH:mm' } },
              y: { beginAtZero: true, title: { display: true, text: 'Persentase (%)' } },
            },
          },
        });
      }
    }
  }, [isOpen, chartData, labels]);

  const handleDownloadPNG = () => { /* ... (tidak ada perubahan) ... */ };
  const handleDownloadExcel = () => { /* ... (tidak ada perubahan) ... */ };
  const handleTimeRangeChange = (range: string) => { setTimeRange(range); };

  // 4. Logika status untuk persentase
  const getStatusInfo = () => {
    if (levelValue >= 95) return { text: 'Penuh', color: 'success' as const };
    if (levelValue >= 20) return { text: 'Normal', color: 'primary' as const };
    if (levelValue > 0) return { text: 'Hampir Habis', color: 'warning' as const };
    return { text: 'Kosong', color: 'danger' as const };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Monitoring Level 2</h1>
        <p className="text-gray-600 mb-4">Persentase Sisa Nutrisi Level 2</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Gauge
              value={levelValue}
              valueMin={0}
              valueMax={100} // valueMax adalah 100 untuk persen
              width={200}
              height={200}
              sx={{
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: statusInfo.color === 'success' ? '#16a34a' : 
                        statusInfo.color === 'primary' ? '#006FEE' : 
                        statusInfo.color === 'warning' ? '#f5a524' : '#f31260',
                },
              }}
            />
          </div>

          <div className="space-y-2">
            <Chip color={statusInfo.color} variant="flat" size="lg">
              {statusInfo.text}
            </Chip>
            <p className="text-2xl font-bold">{levelValue.toFixed(1)}%</p> {/* Unit diubah ke % */}
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
              <ModalHeader className="flex flex-col gap-1">Riwayat Ketinggian Air</ModalHeader>
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