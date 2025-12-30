-- ============================================
-- SKEMA DATABASE SISTEM PENJADWALAN KULIAH
-- ============================================

-- Tabel: users
-- Deskripsi: Menyimpan data pengguna (Admin, Dosen, Mahasiswa)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'dosen', 'mahasiswa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================

-- Tabel: ruangan
-- Deskripsi: Menyimpan data ruangan kuliah
CREATE TABLE ruangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  kapasitas INTEGER NOT NULL,
  gedung VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX idx_ruangan_kode ON ruangan(kode);
CREATE INDEX idx_ruangan_gedung ON ruangan(gedung);

-- ============================================

-- Tabel: mata_kuliah
-- Deskripsi: Menyimpan data mata kuliah
CREATE TABLE mata_kuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  sks INTEGER NOT NULL CHECK (sks >= 1 AND sks <= 6),
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  dosen_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX idx_mata_kuliah_kode ON mata_kuliah(kode);
CREATE INDEX idx_mata_kuliah_dosen_id ON mata_kuliah(dosen_id);
CREATE INDEX idx_mata_kuliah_semester ON mata_kuliah(semester);

-- ============================================

-- Tabel: jadwal_kuliah
-- Deskripsi: Menyimpan data jadwal perkuliahan
CREATE TABLE jadwal_kuliah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mata_kuliah_id UUID NOT NULL REFERENCES mata_kuliah(id) ON DELETE CASCADE,
  ruangan_id UUID NOT NULL REFERENCES ruangan(id) ON DELETE RESTRICT,
  dosen_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  hari VARCHAR(20) NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')),
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  tahun_ajaran VARCHAR(20) NOT NULL, -- Format: "2024/2025"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint untuk memastikan jam_selesai > jam_mulai
  CONSTRAINT chk_waktu CHECK (jam_selesai > jam_mulai)
);

-- Index untuk performa query
CREATE INDEX idx_jadwal_mata_kuliah_id ON jadwal_kuliah(mata_kuliah_id);
CREATE INDEX idx_jadwal_ruangan_id ON jadwal_kuliah(ruangan_id);
CREATE INDEX idx_jadwal_dosen_id ON jadwal_kuliah(dosen_id);
CREATE INDEX idx_jadwal_hari ON jadwal_kuliah(hari);
CREATE INDEX idx_jadwal_tahun_ajaran ON jadwal_kuliah(tahun_ajaran);

-- Composite index untuk conflict detection
CREATE INDEX idx_jadwal_conflict_check ON jadwal_kuliah(hari, ruangan_id, jam_mulai, jam_selesai);
CREATE INDEX idx_jadwal_dosen_conflict ON jadwal_kuliah(hari, dosen_id, jam_mulai, jam_selesai);

-- ============================================

-- VIEW: jadwal_lengkap
-- Deskripsi: View untuk mendapatkan informasi jadwal lengkap dengan JOIN
CREATE VIEW jadwal_lengkap AS
SELECT 
  j.id,
  j.hari,
  j.jam_mulai,
  j.jam_selesai,
  j.semester,
  j.tahun_ajaran,
  mk.id AS mata_kuliah_id,
  mk.kode AS mata_kuliah_kode,
  mk.nama AS mata_kuliah_nama,
  mk.sks,
  r.id AS ruangan_id,
  r.kode AS ruangan_kode,
  r.nama AS ruangan_nama,
  r.kapasitas AS ruangan_kapasitas,
  u.id AS dosen_id,
  u.name AS dosen_nama,
  u.email AS dosen_email
FROM jadwal_kuliah j
JOIN mata_kuliah mk ON j.mata_kuliah_id = mk.id
JOIN ruangan r ON j.ruangan_id = r.id
JOIN users u ON j.dosen_id = u.id;

-- ============================================

-- FUNCTION: detect_ruangan_conflict
-- Deskripsi: Function untuk mendeteksi konflik ruangan
CREATE OR REPLACE FUNCTION detect_ruangan_conflict(
  p_hari VARCHAR,
  p_ruangan_id UUID,
  p_jam_mulai TIME,
  p_jam_selesai TIME,
  p_jadwal_id UUID DEFAULT NULL
) RETURNS TABLE (
  conflicting_jadwal_id UUID,
  mata_kuliah_nama VARCHAR,
  jam_mulai TIME,
  jam_selesai TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    mk.nama,
    j.jam_mulai,
    j.jam_selesai
  FROM jadwal_kuliah j
  JOIN mata_kuliah mk ON j.mata_kuliah_id = mk.id
  WHERE j.hari = p_hari
    AND j.ruangan_id = p_ruangan_id
    AND (p_jadwal_id IS NULL OR j.id != p_jadwal_id)
    AND (
      (j.jam_mulai < p_jam_selesai AND j.jam_selesai > p_jam_mulai)
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================

-- FUNCTION: detect_dosen_conflict
-- Deskripsi: Function untuk mendeteksi konflik dosen
CREATE OR REPLACE FUNCTION detect_dosen_conflict(
  p_hari VARCHAR,
  p_dosen_id UUID,
  p_jam_mulai TIME,
  p_jam_selesai TIME,
  p_jadwal_id UUID DEFAULT NULL
) RETURNS TABLE (
  conflicting_jadwal_id UUID,
  mata_kuliah_nama VARCHAR,
  ruangan_nama VARCHAR,
  jam_mulai TIME,
  jam_selesai TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    mk.nama,
    r.nama,
    j.jam_mulai,
    j.jam_selesai
  FROM jadwal_kuliah j
  JOIN mata_kuliah mk ON j.mata_kuliah_id = mk.id
  JOIN ruangan r ON j.ruangan_id = r.id
  WHERE j.hari = p_hari
    AND j.dosen_id = p_dosen_id
    AND (p_jadwal_id IS NULL OR j.id != p_jadwal_id)
    AND (
      (j.jam_mulai < p_jam_selesai AND j.jam_selesai > p_jam_mulai)
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================

-- TRIGGER: update_timestamp
-- Deskripsi: Otomatis update kolom updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ruangan_updated_at BEFORE UPDATE ON ruangan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mata_kuliah_updated_at BEFORE UPDATE ON mata_kuliah
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jadwal_kuliah_updated_at BEFORE UPDATE ON jadwal_kuliah
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================

-- SAMPLE DATA (Optional - untuk testing)
-- INSERT sample users
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@university.ac.id', 'hashed_password', 'Admin Akademik', 'admin'),
  ('dosen1@university.ac.id', 'hashed_password', 'Dr. Ahmad Santoso', 'dosen'),
  ('dosen2@university.ac.id', 'hashed_password', 'Dr. Siti Nurhaliza', 'dosen'),
  ('mahasiswa@university.ac.id', 'hashed_password', 'Andi Wijaya', 'mahasiswa');

-- INSERT sample ruangan
INSERT INTO ruangan (kode, nama, kapasitas, gedung) VALUES
  ('A101', 'Ruang A101', 40, 'A'),
  ('A102', 'Ruang A102', 40, 'A'),
  ('B101', 'Ruang B101', 30, 'B'),
  ('C101', 'Lab Komputer 1', 30, 'C');

-- ============================================
-- NOTES:
-- 
-- 1. Relasi Database:
--    - users (1) -> (N) mata_kuliah (sebagai dosen)
--    - mata_kuliah (1) -> (N) jadwal_kuliah
--    - ruangan (1) -> (N) jadwal_kuliah
--    - users (1) -> (N) jadwal_kuliah (sebagai dosen)
--
-- 2. Constraint & Validasi:
--    - Role hanya boleh: admin, dosen, mahasiswa
--    - Hari hanya boleh: Senin-Sabtu
--    - SKS: 1-6
--    - Semester: 1-8
--    - jam_selesai harus > jam_mulai
--
-- 3. Indexes:
--    - Primary indexes untuk foreign keys
--    - Composite indexes untuk conflict detection
--    - Individual indexes untuk query filtering
--
-- 4. Functions:
--    - detect_ruangan_conflict(): Cek konflik ruangan
--    - detect_dosen_conflict(): Cek konflik dosen
--    - update_updated_at_column(): Auto-update timestamp
--
-- ============================================

-- QUERY EXAMPLES:
-- 
-- 1. Get all conflicts for a specific schedule:
/*
SELECT * FROM detect_ruangan_conflict(
  'Senin',
  '123e4567-e89b-12d3-a456-426614174000',
  '08:00',
  '10:00'
);
*/

-- 2. Get schedule by day:
/*
SELECT * FROM jadwal_lengkap 
WHERE hari = 'Senin' 
ORDER BY jam_mulai;
*/

-- 3. Get schedule by dosen:
/*
SELECT * FROM jadwal_lengkap 
WHERE dosen_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY hari, jam_mulai;
*/

-- 4. Count conflicts:
/*
SELECT 
  j1.id,
  COUNT(j2.id) as conflict_count
FROM jadwal_kuliah j1
LEFT JOIN jadwal_kuliah j2 ON 
  j1.hari = j2.hari 
  AND j1.id != j2.id
  AND (j1.ruangan_id = j2.ruangan_id OR j1.dosen_id = j2.dosen_id)
  AND (j1.jam_mulai < j2.jam_selesai AND j1.jam_selesai > j2.jam_mulai)
GROUP BY j1.id
HAVING COUNT(j2.id) > 0;
*/
