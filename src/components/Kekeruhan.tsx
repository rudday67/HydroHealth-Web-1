"use client";

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

export default function TurbidityControl() {
  const chartRef = useRef<HTMLCanvasElement>(null);
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

    // 1. Path diubah ke "Hydroponic_Data"
    const dataRef = ref(database, "Hydroponic_Data");
    console.log("Subscribing to Turbidity data from:", dataRef.toString());

    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const allData = snapshot.val();
        if (!allData) {
          setError("No data available under /Hydroponic_Data");
          setIsLoading(false);
          return;
        }

        const turbidityChart: number[] = [];
        const newLabels: string[] = [];
        const newHistoryData: {timestamp: string, value: number}[] = [];

        // 2. Logika looping disesuaikan dengan struktur data baru
        Object.keys(allData).sort().forEach(date => {
          Object.keys(allData[date]).sort().forEach(id => {
            const entry = allData[date][id];
            
            // 3. Ambil data dari field 'turbidity_ntu'
            if (entry && typeof entry.turbidity_ntu !== 'undefined') {
              const timestamp = entry.timestamp_iso || `${date} ${id.replace('-', ':')}`;
              const value = parseFloat(entry.turbidity_ntu);
              
              if (!isNaN(value)) {
                newLabels.push(timestamp);
                turbidityChart.push(value);
                newHistoryData.push({timestamp, value});
              }
            }
          });
        });

        const filteredLabels = filterLabels(newLabels, timeRange);
        const newLabelsLimited = filteredLabels.slice(-30);
        const filteredTurbidity = filterData(turbidityChart, newLabels, newLabelsLimited);

        if (newLabels.length > 0) {
          const latestValue = turbidityChart[turbidityChart.length - 1];
          const latestTimestamp = moment(newLabels[newLabels.length - 1]).format('YYYY-MM-DD HH:mm:ss');
          setTurbidityValue(latestValue);
          setTimestamp(latestTimestamp);
        }

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
  }, [timeRange]);

  const filterLabels = (labels: string[], range: string) => {
    const now = moment();
    let cutoffDate = now.clone();
    
    switch (range) {
      case "1d": cutoffDate.subtract(1, 'days'); break;
      case "7d": cutoffDate.subtract(7, 'days'); break;
      case "1m": cutoffDate.subtract(1, 'months'); break;
      default: cutoffDate.subtract(1, 'days');
    }

    return labels.filter(label => moment(label).isSameOrAfter(cutoffDate));
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
                label: "Kekeruhan (NTU)",
                data: chartData.turbidity,
                backgroundColor: "rgba(139, 69, 19, 0.2)",
                borderColor: "rgba(139, 69, 19, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              // 4. Skala sumbu X diubah menjadi 'time' untuk akurasi
              x: {
                type: 'time',
                time: {
                    unit: 'hour',
                    tooltipFormat: 'YYYY-MM-DD HH:mm',
                }
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Nilai Kekeruhan (NTU)'}
              },
            },
          },
        });
      }
    }
  }, [isOpen, chartData, labels]);
  
  const handleDownloadPNG = () => { /* ... (tidak ada perubahan) ... */ };
  const handleDownloadExcel = () => { /* ... (tidak ada perubahan) ... */ };
  const handleTimeRangeChange = (range: string) => { setTimeRange(range); };

  // Kondisi normal untuk kekeruhan (contoh: < 5 NTU), bisa disesuaikan
  const isNormal = turbidityValue < 5;

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Kekeruhan Air</h1>
        <p className="text-gray-600 mb-4">Nephelometric Turbidity Units (Normal: &lt; 5 NTU)</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Gauge
              value={turbidityValue}
              valueMin={0}
              valueMax={50} // valueMax disesuaikan untuk rentang NTU yang lebih kecil
              width={200}
              height={200}
              sx={{
                [`& .${gaugeClasses.valueArc}`]: {
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
              {isNormal ? 'Jernih' : 'Keruh'}
            </Chip>
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