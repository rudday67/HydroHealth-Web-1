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

export default function TDSControl() {
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

    const esp32Ref = ref(database, "esp32info");
    console.log("Subscribing to TDS data from:", esp32Ref.toString());

    const unsubscribe = onValue(esp32Ref, (snapshot) => {
      try {
        const allData = snapshot.val();
        console.log("Full TDS data structure:", allData);

        if (!allData) {
          setError("No data available under /esp32info");
          setIsLoading(false);
          return;
        }

        // Process all data for chart
        const tdsChart: number[] = [];
        const newLabels: string[] = [];
        const newHistoryData: {timestamp: string, value: number}[] = [];

        // Loop through all dates and times to collect TDS data
        Object.keys(allData).sort().forEach(date => {
          Object.keys(allData[date]).sort().forEach(time => {
            if (allData[date][time].sensor_tds) {
              const timestamp = `${date} ${time}`;
              const value = parseInt(allData[date][time].sensor_tds);
              
              newLabels.push(timestamp);
              tdsChart.push(value);
              newHistoryData.push({timestamp, value});
            }
          });
        });

        // Filter data based on time range
        const filteredLabels = filterLabels(newLabels, timeRange);
        const newLabelsLimited = filteredLabels.slice(-30);
        const filteredTDS = filterData(tdsChart, newLabels, newLabelsLimited);

        // Get latest reading
        if (tdsChart.length > 0) {
          const latestValue = tdsChart[tdsChart.length - 1];
          setTdsValue(latestValue);
          setTimestamp(newLabels[newLabels.length - 1]);
        }

        // Update chart data
        setChartData({ tds: filteredTDS });
        setLabels(newLabelsLimited);
        setHistoryData(newHistoryData.reverse()); // Reverse to show latest first
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
      case "1d":
        cutoffDate.subtract(1, 'days');
        break;
      case "7d":
        cutoffDate.subtract(7, 'days');
        break;
      case "1m":
        cutoffDate.subtract(1, 'months');
        break;
      default:
        cutoffDate.subtract(1, 'days');
    }

    return labels.filter(label => {
      const labelDate = moment(label, "YYYY-MM-DD HH:mm");
      return labelDate.isSameOrAfter(cutoffDate);
    });
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
      // Destroy previous chart if exists
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
                type: "category",
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'TDS Value (PPM)'
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

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Nutrisi TDS</h1>
        <p className="text-gray-600">Total Dissolved Solids (Normal: 1200-1400 PPM)</p>
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
                  fill: tdsValue >= 1200 && tdsValue <= 1400 ? '#4CAF50' : '#F44336',
                },
              }}
            />
          </div>

          <div className="space-y-2">
            <Chip 
              color={tdsValue >= 1200 && tdsValue <= 1400 ? 'success' : 'danger'}
              variant="flat"
              size="lg"
            >
              {tdsValue >= 1200 && tdsValue <= 1400 ? 'Normal' : 'Tidak Normal'}
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