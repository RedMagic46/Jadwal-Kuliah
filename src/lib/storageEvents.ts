// Helper untuk trigger custom event setelah perubahan localStorage
// Ini memungkinkan update real-time di tab yang sama

export const triggerStorageEvent = (key: string) => {
  // Trigger custom event untuk tab yang sama
  window.dispatchEvent(new CustomEvent('localStorageChange', { 
    detail: { key } 
  }));
  
  // Juga trigger storage event untuk sinkronisasi
  // Storage event hanya ter-trigger untuk tab lain, bukan tab yang sama
  // Jadi kita perlu custom event untuk tab yang sama
};

