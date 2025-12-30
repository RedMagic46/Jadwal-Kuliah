import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Schedule } from '../types/schedule';

/**
 * UTILITY UNTUK EXPORT PDF
 * Mendukung 2 mode:
 * 1. List View - Export tabel biasa dengan semua kolom
 * 2. Table View - Export jadwal dalam format grid (Hari x Jam)
 */

// Helper untuk format tanggal
const formatDate = () => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('id-ID', options);
};

/**
 * Export List View ke PDF
 * Format: Tabel biasa dengan kolom Kode, Nama, Hari, Waktu, Ruangan, Dosen, Status
 */
export const exportListViewPDF = (schedules: Schedule[]) => {
  const doc = new jsPDF('landscape');

  // Header
  doc.setFontSize(18);
  doc.text('JADWAL KULIAH', doc.internal.pageSize.getWidth() / 2, 15, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.text(
    `Dicetak pada: ${formatDate()}`,
    doc.internal.pageSize.getWidth() / 2,
    22,
    { align: 'center' }
  );

  // Prepare data
  const tableData = schedules.map((schedule) => [
    schedule.courseCode,
    schedule.courseName,
    schedule.day,
    `${schedule.startTime} - ${schedule.endTime}`,
    schedule.roomName,
    schedule.lecturer,
    schedule.hasConflict ? 'BENTROK' : 'OK',
  ]);

  // Generate table
  autoTable(doc, {
    head: [['Kode', 'Mata Kuliah', 'Hari', 'Waktu', 'Ruangan', 'Dosen', 'Status']],
    body: tableData,
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Kode
      1: { cellWidth: 60 }, // Mata Kuliah
      2: { cellWidth: 25 }, // Hari
      3: { cellWidth: 40 }, // Waktu
      4: { cellWidth: 25 }, // Ruangan
      5: { cellWidth: 50 }, // Dosen
      6: { cellWidth: 20, halign: 'center' }, // Status
    },
    didParseCell: (data) => {
      // Highlight bentrok dengan warna merah
      if (data.section === 'body' && data.column.index === 6) {
        const rowData = schedules[data.row.index];
        if (rowData.hasConflict) {
          data.cell.styles.fillColor = [239, 68, 68]; // Red
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.fillColor = [34, 197, 94]; // Green
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`Jadwal-Kuliah-List-${Date.now()}.pdf`);
};

/**
 * Export Table View ke PDF
 * Format: Grid Hari (baris) x Jam (kolom) seperti jadwal kuliah pada umumnya
 */

// Mapping jam akademik UMM (14 slot waktu) - sama dengan di ScheduleEditModal & ScheduleTableView
const TIME_SLOTS = [
  { slot: 1, start: '07:00', end: '07:50' },
  { slot: 2, start: '07:50', end: '08:40' },
  { slot: 3, start: '08:40', end: '09:30' },
  { slot: 4, start: '09:30', end: '10:20' },
  { slot: 5, start: '10:20', end: '11:10' },
  { slot: 6, start: '11:10', end: '12:00' },
  { slot: 7, start: '12:30', end: '13:20' },
  { slot: 8, start: '13:20', end: '14:10' },
  { slot: 9, start: '14:10', end: '15:00' },
  { slot: 10, start: '15:30', end: '16:20' },
  { slot: 11, start: '16:20', end: '17:10' },
  { slot: 12, start: '18:15', end: '19:05' },
  { slot: 13, start: '19:05', end: '19:55' },
  { slot: 14, start: '19:55', end: '20:45' },
];

// Helper function: Convert waktu (HH:mm) ke slot number
const timeToSlot = (time: string): number => {
  const slot = TIME_SLOTS.find(t => t.start === time);
  return slot ? slot.slot : 1;
};

// Helper function: Convert endTime ke slot number (cari berdasarkan end time)
const endTimeToSlot = (time: string): number => {
  // Cek apakah waktu ini adalah start dari sebuah slot (berarti ini end yang valid)
  const startSlot = TIME_SLOTS.find(t => t.start === time);
  if (startSlot) {
    return startSlot.slot; // Return slot tersebut (exclusive)
  }
  
  // Jika tidak, cari slot yang end-nya sama dengan waktu ini
  const endSlot = TIME_SLOTS.find(t => t.end === time);
  if (endSlot) {
    return endSlot.slot + 1; // Return slot setelahnya (karena endSlot exclusive)
  }
  
  // Fallback
  return 15; // Beyond all slots
};

export const exportTableViewPDF = (schedules: Schedule[]) => {
  const doc = new jsPDF('landscape');

  // Header
  doc.setFontSize(18);
  doc.text('JADWAL KULIAH - TABEL VIEW', doc.internal.pageSize.getWidth() / 2, 15, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.text(
    `Dicetak pada: ${formatDate()}`,
    doc.internal.pageSize.getWidth() / 2,
    22,
    { align: 'center' }
  );

  // Define time slots dengan format yang benar
  const timeSlots = TIME_SLOTS.map(t => ({
    label: `Jam ${t.slot}\n${t.start.replace(':', '.')}-${t.end.replace(':', '.')}`,
    slot: t.slot,
    start: t.start,
  }));

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayLabels: Record<string, string> = {
    Monday: 'Senin',
    Tuesday: 'Selasa',
    Wednesday: 'Rabu',
    Thursday: 'Kamis',
    Friday: 'Jumat',
    Saturday: 'Sabtu',
  };

  // Helper untuk cek overlap waktu (gunakan slot-based logic)
  const getScheduleForDayAndSlot = (day: string, slot: number): Schedule | null => {
    return schedules.find((schedule) => {
      const scheduleStartSlot = timeToSlot(schedule.startTime);
      const scheduleEndSlot = endTimeToSlot(schedule.endTime);

      return (
        schedule.day === day &&
        slot >= scheduleStartSlot &&
        slot < scheduleEndSlot
      );
    }) || null;
  };

  // Helper untuk cek apakah slot adalah starting cell dari jadwal
  const isStartingSlot = (schedule: Schedule, slot: number): boolean => {
    const scheduleStartSlot = timeToSlot(schedule.startTime);
    return scheduleStartSlot === slot;
  };

  // Helper untuk hitung berapa kolom yang harus di-span
  const calculateColSpan = (schedule: Schedule): number => {
    const startSlot = timeToSlot(schedule.startTime);
    const endSlot = endTimeToSlot(schedule.endTime);
    return endSlot - startSlot;
  };

  // Build table data
  const tableData = days.map((day) => {
    const row = [dayLabels[day]];
    const processedSlots = new Set<number>(); // Track which slot indices have been processed

    timeSlots.forEach((timeSlot, slotIndex) => {
      // Skip jika slot ini sudah diproses (bagian dari colspan sebelumnya)
      if (processedSlots.has(slotIndex)) {
        return;
      }

      const schedule = getScheduleForDayAndSlot(day, timeSlot.slot);

      if (schedule) {
        // Cek apakah ini starting slot
        if (isStartingSlot(schedule, timeSlot.slot)) {
          const colSpan = calculateColSpan(schedule);
          
          // Add cell dengan colspan info
          row.push({
            content: `${schedule.courseCode}\n${schedule.courseName}\n${schedule.roomName}\n${schedule.lecturer}`,
            colSpan: colSpan,
            styles: { fillColor: [219, 234, 254] } // Light blue
          });
          
          // Mark next slots as processed
          for (let i = 1; i < colSpan; i++) {
            processedSlots.add(slotIndex + i);
          }
        }
        // Jika bukan starting slot, skip (sudah di-handle oleh starting slot)
      } else {
        // Empty cell
        row.push('-');
      }
    });

    return row;
  });

  // Generate table
  autoTable(doc, {
    head: [['Hari', ...timeSlots.map((slot) => slot.label)]],
    body: tableData,
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7,
      minCellHeight: 8,
    },
    styles: {
      fontSize: 6,
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.3,
      lineColor: [200, 200, 200],
      minCellHeight: 12,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: {
        cellWidth: 18,
        fillColor: [243, 244, 246],
        fontStyle: 'bold',
        fontSize: 7,
      },
      // Kolom jam - width otomatis dibagi rata untuk 14 kolom
    },
    didParseCell: (data) => {
      // Atur warna untuk cell yang ada jadwalnya
      if (data.section === 'body' && data.column.index > 0) {
        if (data.cell.text[0] !== '-') {
          data.cell.styles.fillColor = [219, 234, 254]; // Light blue
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Halaman ${i} dari ${pageCount} | Jadwal Kuliah 7.00-20.45`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`Jadwal-Kuliah-Table-${Date.now()}.pdf`);
};