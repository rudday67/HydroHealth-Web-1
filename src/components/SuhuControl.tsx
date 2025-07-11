// import { useRef, useEffect, useState, useCallback } from "react";
// import { Chart } from "chart.js/auto";
// import { ref, onValue } from "firebase/database";
// import { database } from "../../firebaseConfig";
// import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
// import {
//   Button,
//   Dropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownTrigger,
// } from "@nextui-org/react";
// import TuneIcon from "@mui/icons-material/Tune";
// import * as XLSX from "xlsx";

// export default function LineChartSuhu() {
//   const chartRef = useRef<HTMLCanvasElement>(null);
//   const [chartData, setChartData] = useState<{
//     kelembaban: number[];
//     udara: number[];
//   }>({ kelembaban: [], udara: [] });
//   const [labels, setLabels] = useState<string[]>([]);
//   const [timestamp, setTimestamp] = useState<string>("");

//   const fetchData = useCallback(async (timeRange: string = "1d") => {
//     try {
//       const sensorRef = ref(database, "Monitoring");
//       onValue(sensorRef, (snapshot) => {
//         const data = snapshot.val();
//         console.log(data); // Tambahkan log ini untuk debugging
//         if (data) {
//           const temperatureValues: number[] = [];
//           const humidityValues: number[] = [];
//           const newLabels: string[] = [];

//           Object.keys(data).forEach((time) => {
//             newLabels.push(time);
//             temperatureValues.push(parseFloat(data[time].Suhu));
//             humidityValues.push(parseFloat(data[time].Kelembaban));
//           });

//           const filteredLabels = filterLabels(newLabels, timeRange);
//           const newLabelsLimited = filteredLabels.slice(-30); // Ambil 30 data terbaru
//           const filteredTemperature = filterData(temperatureValues, newLabels, newLabelsLimited);
//           const filteredHumidity = filterData(humidityValues, newLabels, newLabelsLimited);

//           setLabels(newLabelsLimited);
//           setChartData({ udara: filteredTemperature, kelembaban: filteredHumidity });

//           const latestTime = newLabelsLimited[newLabelsLimited.length - 1];
//           setTimestamp(latestTime);
//         }
//       });
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const filterLabels = (labels: string[], timeRange: string) => {
//     const currentDate = new Date();
//     let filterDate = new Date();

//     switch (timeRange) {
//       case "1d":
//         filterDate.setDate(currentDate.getDate() - 1);
//         break;
//       case "7d":
//         filterDate.setDate(currentDate.getDate() - 7);
//         break;
//       case "1m":
//         filterDate.setMonth(currentDate.getMonth() - 1);
//         break;
//       default:
//         break;
//     }

//     return labels.filter((label) => {
//       const [hours, minutes] = label.split(":").map(Number);
//       const labelDate = new Date();
//       labelDate.setHours(hours);
//       labelDate.setMinutes(minutes);
//       return labelDate >= filterDate;
//     });
//   };

//   const filterData = (data: number[], originalLabels: string[], filteredLabels: string[]) => {
//     return originalLabels.reduce((acc, label, index) => {
//       if (filteredLabels.includes(label)) {
//         acc.push(data[index]);
//       }
//       return acc;
//     }, [] as number[]);
//   };

//   const drawChart = useCallback(() => {
//     if (chartRef.current) {
//       if ((chartRef.current as any).chart) {
//         (chartRef.current as any).chart.destroy();
//       }

//       const context = chartRef.current.getContext("2d");

//       if (context) {
//         const newChart = new Chart(context, {
//           type: "line",
//           data: {
//             labels: labels,
//             datasets: [
//               {
//                 label: "Suhu Udara (°C)",
//                 data: chartData.udara,
//                 backgroundColor: "rgba(54, 162, 235, 0.2)",
//                 borderColor: "rgba(54, 162, 235, 1)",
//                 borderWidth: 1,
//               },
//               {
//                 label: "Kelembaban (%)",
//                 data: chartData.kelembaban,
//                 backgroundColor: "rgba(255, 99, 132, 0.2)",
//                 borderColor: "rgba(255, 99, 132, 1)",
//                 borderWidth: 1,
//               },
//             ],
//           },
//           options: {
//             scales: {
//               x: {
//                 type: "category",
//               },
//               y: {
//                 beginAtZero: false,
//               },
//             },
//           },
//         });
//         (chartRef.current as any).chart = newChart;
//       }
//     }
//   }, [chartData, labels]);

//   useEffect(() => {
//     drawChart();
//   }, [drawChart]);

//   const handleDownloadImagePNG = () => {
//     if (chartRef.current) {
//       const file = chartRef.current.toDataURL("image/png");
//       const link = document.createElement("a");
//       link.href = file;
//       link.download = "LineChartSuhu.png";
//       link.click();
//     }
//   };

//   const handleDownloadExcel = () => {
//     if (chartRef.current && (chartRef.current as any).chart) {
//       const chart = (chartRef.current as any).chart;
//       const data = [
//         ["Tanggal", "Waktu", "Suhu Udara (°C)", "Kelembaban (%)"],
//         ...chart.data.labels.map((label: any, index: number) => [
//           "",
//           label,
//           chart.data.datasets[0].data[index],
//           chart.data.datasets[1].data[index],
//         ]),
//       ];
//       const worksheet = XLSX.utils.aoa_to_sheet(data);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "SheetSuhu");
//       XLSX.writeFile(workbook, "LineChartSuhu.xlsx");
//     }
//   };

//   const handleTimeRangeChange = (range: string) => {
//     fetchData(range);
//   };


//   return (
//     <div className="outline p-2 outline-green-200 rounded-lg h-full w-full">
//       <div className="flex flex-row justify-center items-center">
//       <p className="text-sm pb-2">Suhu Normal: 18℃-30℃ || Kelembaban Normal: 60%-80% </p>
//         {/* <Dropdown backdrop="transparent" radius="sm" className="p-1 mb-4">
//           <DropdownTrigger>
//             <Button variant="flat" color="success" size="sm" radius="sm">
//               <TuneIcon />
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu aria-label="Filter Time Range">
//             <DropdownItem
//               onClick={() => handleTimeRangeChange("1d")}
//               key="1d"
//             >
//               1 Hari yang Lalu
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => handleTimeRangeChange("7d")}
//               key="7d"
//             >
//               7 Hari yang Lalu
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => handleTimeRangeChange("1m")}
//               key="1m"
//             >
//               1 Bulan yang Lalu
//             </DropdownItem>
//           </DropdownMenu>
//         </Dropdown> */}
//       </div>

//       <canvas className="h-[45%]" ref={chartRef} />
//       <div className="flex flex-row gap-2 justify-center items-center pt-1">
//         <Dropdown backdrop="transparent" radius="sm" className="p-1">
//           <DropdownTrigger>
//             <Button variant="flat" color="success" size="sm" radius="sm">
//               Chart Menu
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu aria-label="Actions">
//             <DropdownItem
//               onClick={handleDownloadImagePNG}
//               startContent={<ImageOutlinedIcon fontSize="small" />}
//               key="png"
//               color="default"
//               variant="flat"
//             >
//               Simpan Gambar (.png)
//             </DropdownItem>
//             <DropdownItem
//               onClick={handleDownloadExcel}
//               startContent={<InsertDriveFileIcon fontSize="small" />}
//               key="excel"
//               color="default"
//               variant="flat"
//             >
//               Simpan File Excel (.xlsx)
//             </DropdownItem>
//           </DropdownMenu>
//         </Dropdown>
//       </div>
//     </div>
//   );
// }
