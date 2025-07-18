import { Chart } from "chart.js/auto";
import { ref, onValue, query, limitToLast } from "firebase/database";
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

export default function PhControl() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<{ pH: number[] }>({ pH: [] });
  const [labels, setLabels] = useState<string[]>([]);
  const [pHValue, setpHValue] = useState<number>(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [timestamp, setTimestamp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>("1d");

  useEffect(() => {
    if (!database) {
      setError("Firebase Database not initialized");
      setIsLoading(false);
      return;
    }

    const esp32Ref = ref(database, "esp32info");
    console.log("Subscribing to pH data from:", esp32Ref.toString());

    const unsubscribe = onValue(esp32Ref, (snapshot) => {
      try {
        const allData = snapshot.val();
        console.log("Full pH data structure:", allData);

        if (!allData) {
          setError("No data available under /esp32info");
          setIsLoading(false);
          return;
        }

        // Process all data for chart
        const pHChart: number[] = [];
        const newLabels: string[] = [];

        // Loop through all dates and times to collect pH data
        Object.keys(allData).sort().forEach(date => {
          Object.keys(allData[date]).sort().forEach(time => {
            if (allData[date][time].sensor_ph) {
              newLabels.push(`${date} ${time}`);
              pHChart.push(parseFloat(allData[date][time].sensor_ph));
            }
          });
        });

        // Filter data based on time range
        const filteredLabels = filterLabels(newLabels, timeRange);
        const newLabelsLimited = filteredLabels.slice(-30);
        const filteredpH = filterData(pHChart, newLabels, newLabelsLimited);

        // Get latest reading
        if (pHChart.length > 0) {
          const latestValue = pHChart[pHChart.length - 1];
          setpHValue(latestValue);
          setTimestamp(newLabels[newLabels.length - 1]);
        }

        // Update chart data
        setChartData({ pH: filteredpH });
        setLabels(newLabelsLimited);
        setError("");

      } catch (error) {
        console.error("pH data processing error:", error);
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
    if (isOpen && chartRef.current && chartData.pH.length > 0) {
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
                label: "pH",
                data: chartData.pH,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
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
                beginAtZero: false,
                min: 0,
                max: 14,
                title: {
                  display: true,
                  text: 'pH Value'
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
      link.download = "phLineChart.png";
      link.click();
    }
  };

  const handleDownloadExcel = () => {
    const data = [
      ["Waktu", "pH Hidroponik"],
      ...labels.map((label, index) => [label, chartData.pH[index]])
    ];
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "SheetpH");
    XLSX.writeFile(workbook, "LineChartpH.xlsx");
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Monitoring pH Air</h1>
        <p className="text-gray-600">pH</p>
        <p>(Normal: 6.0-7.0)</p>     
      </div>

      {/* Konten Utama */}
      <Card className="max-w-md mx-auto">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Gauge
              value={pHValue}
              valueMin={0}
              valueMax={14}
              width={200}
              height={200}
              sx={{
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: pHValue >= 6 && pHValue <= 7 ? '#4CAF50' : '#F44336',
                },
              }}
            />
          </div>

          <div className="space-y-2">
            <Chip 
              color={pHValue >= 6 && pHValue <= 7 ? 'success' : 'danger'}
              variant="flat"
              size="lg"
            >
              {pHValue >= 6 && pHValue <= 7 ? 'Normal' : 'Tidak Normal'}
            </Chip>
            <p className="text-2xl font-bold">{pHValue.toFixed(2)}</p>
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
              <ModalHeader className="flex flex-col gap-1">History pH</ModalHeader>
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