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
  TimeScale,
  ChartOptions,
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

// 1. Konfigurasi sensor disesuaikan dengan field di Firebase Anda
const sensorConfig = [
  { key: 'tds1_ppm', label: 'TDS 1 (PPM)', borderColor: 'rgb(255, 99, 132)' },
  { key: 'tds2_ppm', label: 'TDS 2 (PPM)', borderColor: 'rgb(255, 159, 64)' },
  { key: 'turbidity_ntu', label: 'Kekeruhan (NTU)', borderColor: 'rgb(139, 69, 19)' },
  { key: 'level1_percent', label: 'Level 1 (%)', borderColor: 'rgb(75, 192, 192)' },
  { key: 'level2_percent', label: 'Level 2 (%)', borderColor: 'rgb(54, 162, 235)' },
  { key: 'flow_rate_lpm', label: 'Aliran (L/min)', borderColor: 'rgb(153, 102, 255)' },
  // Tambahkan sensor lain jika ada, contoh:
  // { key: 'level3_percent', label: 'Level 3 (%)', borderColor: 'rgb(255, 205, 86)' },
];

export default function CombinedChart() {
  interface SensorData {
    timestamp: moment.Moment;
    [key: string]: any;
  }
  const [rawData, setRawData] = useState<SensorData[]>([]);
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: [],
  });
  const [startDate, setStartDate] = useState(moment().subtract(1, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<ChartJSInstance<'line'>>(null);

  // 2. Logika pengambilan data disesuaikan dengan struktur baru
  useEffect(() => {
    const dataRef = ref(database, 'Hydroponic_Data'); // Path diubah
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const processedData: SensorData[] = [];
        Object.keys(data).forEach(date => {
          Object.keys(data[date]).forEach(id => {
            const entry = data[date][id];
            if (entry && entry.timestamp_iso) {
              processedData.push({
                timestamp: moment(entry.timestamp_iso),
                ...entry
              });
            }
          });
        });
        processedData.sort((a, b) => a.timestamp.diff(b.timestamp));
        setRawData(processedData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      setIsLoading(false);
    });
  }, []);

  const handleFilterData = React.useCallback(() => {
    if (rawData.length === 0) return;

    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const filteredData = rawData.filter(item => 
      item.timestamp.isBetween(start, end)
    );

    const labels = filteredData.map(item => item.timestamp.format('YYYY-MM-DD HH:mm:ss'));
    
    const datasets = sensorConfig.map(sensor => ({
      label: sensor.label,
      data: filteredData.map(item => item[sensor.key] !== undefined ? item[sensor.key] : null),
      borderColor: sensor.borderColor,
      backgroundColor: sensor.borderColor.replace(')', ', 0.5)').replace('rgb', 'rgba'),
      fill: false,
      tension: 0.1,
    }));

    setChartData({ labels, datasets });
  }, [rawData, startDate, endDate]);
  
  useEffect(() => {
    if (rawData.length > 0) {
      handleFilterData();
    }
  }, [rawData, handleFilterData]);

  // 3. Fungsi ekspor diperbaiki dengan pengecekan data
  const handleExportExcel = () => {
    if (chartData.labels.length === 0) {
      alert("Tidak ada data untuk diekspor. Silakan filter data terlebih dahulu.");
      return;
    }
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
  
  const handleExportPDF = () => {
    if (!chartRef.current) {
      alert("Chart belum siap untuk diekspor.");
      return;
    }
    if (chartData.labels.length === 0) {
      alert("Tidak ada data untuk diekspor. Silakan filter data terlebih dahulu.");
      return;
    }
    const doc = new jsPDF({ orientation: 'landscape' });
    const chartImage = chartRef.current.toBase64Image();
    doc.text("Laporan Data Monitoring", 14, 15);
    doc.addImage(chartImage, 'PNG', 10, 25, 280, 120);
    (doc as any).autoTable({
        startY: 155,
        head: [['Waktu', ...chartData.datasets.map(ds => ds.label)]],
        body: chartData.labels.map((label, index) => [
            label,
            ...chartData.datasets.map(ds => ds.data[index])
        ]),
        theme: 'grid',
        styles: { fontSize: 8 },
    });
    doc.save('LaporanMonitoring.pdf');
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Grafik Data Sensor Gabungan' }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'hour', tooltipFormat: 'YYYY-MM-DD HH:mm:ss', displayFormats: { hour: 'D MMM HH:mm' } },
        title: { display: true, text: 'Waktu' }
      },
      y: {
        title: { display: true, text: 'Nilai Sensor' }
      }
    }
  };

  return (
    <Card className="w-full p-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Dashboard IoT Gabungan</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <Input type="date" label="Dari" value={startDate} onChange={(e) => setStartDate(e.target.value)} size="sm" />
          <Input type="date" label="s.d." value={endDate} onChange={(e) => setEndDate(e.target.value)} size="sm"/>
          <Button color="primary" onClick={handleFilterData}>Tampilkan</Button>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p className="text-center p-10">Memuat data...</p>
        ) : (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        )}
      </CardBody>
      <CardFooter className="flex gap-2 justify-end">
          <Button color="success" variant="flat" onClick={handleExportExcel}>Export Excel</Button>
          <Button color="danger" variant="flat" onClick={handleExportPDF}>Export PDF</Button>
      </CardFooter>
    </Card>
  );
}