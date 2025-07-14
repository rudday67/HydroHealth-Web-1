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

// Nama komponen bisa disesuaikan agar lebih spesifik
export default function TDS1Control() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<{ tds: number[] }>({ tds: [] });
  const [labels, setLabels] = useState<string[]>([]);
  const [tdsValue, setTdsValue] = useState<number>(0);
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
    console.log("Subscribing to TDS data from:", dataRef.toString());

    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        const allData = snapshot.val();
        if (!allData) {
          setError("No data available under /Hydroponic_Data");
          setIsLoading(false);
          return;
        }

        const tdsChart: number[] = [];
        const newLabels: string[] = [];
        const newHistoryData: {timestamp: string, value: number}[] = [];

        // 2. Logika looping disesuaikan dengan struktur data baru
        Object.keys(allData).sort().forEach(date => {
          // Loop melalui ID urutan (contoh: '00-01', '00-02')
          Object.keys(allData[date]).sort().forEach(id => {
            const entry = allData[date][id];
            
            // 3. Ambil data dari field 'tds1_ppm'
            if (entry && typeof entry.tds1_ppm !== 'undefined') {
              // 4. Gunakan 'timestamp_iso' untuk waktu yang akurat
              const timestamp = entry.timestamp_iso || `${date} ${id.replace('-', ':')}`;
              const value = parseFloat(entry.tds1_ppm);
              
              if (!isNaN(value)) {
                newLabels.push(timestamp);
                tdsChart.push(value);
                newHistoryData.push({timestamp, value});
              }
            }
          });
        });

        const filteredLabels = filterLabels(newLabels, timeRange);
        const newLabelsLimited = filteredLabels.slice(-30);
        const filteredTDS = filterData(tdsChart, newLabels, newLabelsLimited);

        if (newLabels.length > 0) {
          const latestValue = tdsChart[tdsChart.length - 1];
          const latestTimestamp = moment(newLabels[newLabels.length - 1]).format('YYYY-MM-DD HH:mm:ss');
          setTdsValue(latestValue);
          setTimestamp(latestTimestamp);
        }

        setChartData({ tds: filteredTDS });
        setLabels(newLabelsLimited);
        setHistoryData(newHistoryData.reverse());
        setError("");

      } catch (error) {
        console.error("TDS data processing error:", error);
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
    if (isOpen && chartRef.current && chartData.tds.length > 0) {
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
                label: "TDS (PPM)",
                data: chartData.tds,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'time', // Gunakan 'time' scale untuk timestamp ISO
                time: {
                    unit: 'hour',
                    tooltipFormat: 'YYYY-MM-DD HH:mm',
                }
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'TDS Value (PPM)' }
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
      link.href = file;
      link.download = "tdsLineChart.png";
      link.click();
    }
  };

  const handleDownloadExcel = () => {
    const data = [
      ["Waktu", "TDS (PPM)"],
      ...labels.map((label, index) => [label, chartData.tds[index]])
    ];
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "SheetTDS");
    XLSX.writeFile(workbook, "LineChartTDS.xlsx");
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Anda bisa sesuaikan rentang nilai normal ini jika perlu
  const isNormal = tdsValue >= 1200 && tdsValue <= 1400;

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Monitoring TDS</h1>
        <p className="text-gray-600 mb-4">Total Dissolved Solids (Normal: 1200-1400 PPM)</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Gauge
              value={tdsValue}
              valueMin={0}
              valueMax={2000}
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
            <Chip color={isNormal ? 'success' : 'danger'} variant="flat" size="lg">
              {isNormal ? 'Normal' : 'Tidak Normal'}
            </Chip>
            <p className="text-2xl font-bold">{tdsValue} PPM</p>
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
              <ModalHeader className="flex flex-col gap-1">History TDS</ModalHeader>
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
                        <DropdownItem onClick={() => handleTimeRangeChange("1d")} key="1d">
                          1 Hari yang Lalu
                        </DropdownItem>
                        <DropdownItem onClick={() => handleTimeRangeChange("7d")} key="7d">
                          7 Hari yang Lalu
                        </DropdownItem>
                        <DropdownItem onClick={() => handleTimeRangeChange("1m")} key="1m">
                          1 Bulan yang Lalu
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div>
                    <canvas ref={chartRef} />
                  </div>
                  
                  {/* Tampilan riwayat TDS dengan timestamp
                  <div className="mt-4 space-y-2 text-center">
                    <p className="font-medium">TDS Value</p>
                    <div className="max-h-60 overflow-y-auto">
                      {historyData.map((item, index) => (
                        <p key={index} className="text-sm py-1 border-b border-gray-100">
                          {item.timestamp} - {item.value} PPM
                        </p>
                      ))}
                    </div>
                  </div> */}

                  <div className="mt-6 flex justify-center items-center w-full">
                    <Dropdown backdrop="opaque" radius="sm" className="p-2">
                      <DropdownTrigger>
                        <Button variant="flat" color="success" size="sm" radius="sm">
                          Download chart
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Actions">
                        <DropdownItem
                          onClick={handleDownloadPNG}
                          startContent={<ImageOutlinedIcon fontSize="small" />}
                          key="png"
                          color="default"
                          variant="flat"
                        >
                          Image(.png)
                        </DropdownItem>
                        <DropdownItem
                          onClick={handleDownloadExcel}
                          startContent={<InsertDriveFileIcon fontSize="small" />}
                          key="excel"
                          color="default"
                          variant="flat"
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