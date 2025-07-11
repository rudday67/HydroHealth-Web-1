"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from "../../firebaseConfig"; // PASTIKAN PATH INI BENAR
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-moment';
import moment from 'moment';
import { Button, Card, CardBody, CardHeader, CardFooter, Input } from '@nextui-org/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Chart as ChartJSInstance } from 'chart.js';

// Registrasi komponen-komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// **PENTING**: Konfigurasi sensor yang ingin Anda tampilkan.
// Sesuaikan 'key' dengan nama field di Firebase Anda.
const sensorConfig = [
  { key: 'sensor_tds', label: 'TDS (PPM)', borderColor: 'rgb(255, 99, 132)' },
  { key: 'sensor_ph', label: 'pH Air', borderColor: 'rgb(54, 162, 235)' },
  { key: 'sensor_kekeruhan', label: 'Kekeruhan (NTU)', borderColor: 'rgb(75, 192, 192)' },
  { key: 'sensor_ketinggian', label: 'Ketinggian Air (cm)', borderColor: 'rgb(153, 102, 255)' },
  // Tambahkan konfigurasi sensor lainnya di sini jika perlu
];

export default function CombinedChart() {
  // Tipe data untuk satu entri data sensor
  interface SensorData {
    timestamp: moment.Moment;
    [key: string]: any;
  }
  const [rawData, setRawData] = useState<SensorData[]>([]);
  interface ChartDataset {
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }

  interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }

  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [startDate, setStartDate] = useState(moment().subtract(1, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<ChartJSInstance | null>(null);

  // Mengambil data mentah dari Firebase saat komponen dimuat
  useEffect(() => {
    const dataRef = ref(database, 'esp32info'); // Path ke data Anda di Firebase
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const processedData: SensorData[] = [];
        Object.keys(data).forEach(date => {
          Object.keys(data[date]).forEach(time => {
            const timestamp = `${date} ${time}`;
            processedData.push({
              timestamp: moment(timestamp, "YYYY-MM-DD HH:mm:ss"),
              ...data[date][time]
            });
          });
        });
        setRawData(processedData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      setIsLoading(false);
    });
  }, []);

  // Fungsi untuk memfilter dan menampilkan data ke chart
  const handleFilterData = React.useCallback(() => {
    if (rawData.length === 0) return;

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const filteredData = rawData.filter(item => 
      item.timestamp.isBetween(start, end)
    );

    const labels = filteredData.map(item => item.timestamp.format('YYYY-MM-DD HH:mm'));
    
    const datasets = sensorConfig.map(sensor => ({
      label: sensor.label,
      data: filteredData.map(item => item[sensor.key] || null),
      borderColor: sensor.borderColor,
      backgroundColor: sensor.borderColor.replace(')', ', 0.5)').replace('rgb', 'rgba'),
      fill: false,
      tension: 0.1,
    }));

    setChartData({ labels, datasets });
  }, [rawData, startDate, endDate]);
  
  // Menjalankan filter secara otomatis saat data pertama kali siap
  useEffect(() => {
    if (rawData.length > 0) {
      handleFilterData();
    }
  }, [rawData, handleFilterData]);

  // Fungsi untuk mengekspor ke Excel
  const handleExportExcel = () => {
    const dataToExport = [
      ['Waktu', ...chartData.datasets.map(ds => ds.label)],
      ...chartData.labels.map((label, index) => [
        label,
        ...chartData.datasets.map(ds => ds.data[index])
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Monitoring');
    XLSX.writeFile(workbook, 'DataMonitoring.xlsx');
  };
  
  // Fungsi untuk mengekspor ke PDF
  const handleExportPDF = () => {
    if (!chartRef.current) return;
    const doc = new jsPDF();
    const chartImage = chartRef.current.toBase64Image();

    doc.text("Laporan Data Monitoring", 14, 15);
    doc.addImage(chartImage, 'PNG', 10, 25, 190, 100);

    (doc as any).autoTable({
        startY: 135,
        head: [['Waktu', ...chartData.datasets.map(ds => ds.label)]],
        body: chartData.labels.map((label, index) => [
            label,
            ...chartData.datasets.map(ds => ds.data[index])
        ]),
    });
    
    doc.save('LaporanMonitoring.pdf');
  };

  return (
    <Card className="w-full p-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Dashboard IoT Gabungan</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <Input type="date" label="Dari" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" label="s.d." value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button color="primary" onClick={handleFilterData}>Tampilkan</Button>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <>
            <p>Memuat data...</p>
          </>
        ) : (
          <Line
            ref={(el) => {
              // @ts-ignore
              chartRef.current = el?.chartInstance || el;
            }}
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Grafik Data Sensor' }
              },
              scales: {
                  x: {
                      type: 'time',
                      time: {
                          unit: 'hour',
                          tooltipFormat: 'YYYY-MM-DD HH:mm',
                          displayFormats: {
                              hour: 'D MMM HH:mm'
                          }
                      },
                      title: { display: true, text: 'Waktu' }
                  },
                  y: {
                      title: { display: true, text: 'Nilai Sensor' }
                  }
              }
            }}
          />
        )}
      </CardBody>
      <CardFooter className="flex gap-2 justify-end">
          <Button color="success" variant="flat" onClick={handleExportExcel}>Export Excel</Button>
          <Button color="danger" variant="flat" onClick={handleExportPDF}>Export PDF</Button>
      </CardFooter>
    </Card>
  );
}