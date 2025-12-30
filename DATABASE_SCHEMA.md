# SKEMA DATABASE - SISTEM PENJADWALAN KULIAH

## 1. Tabel: users
Menyimpan data pengguna sistem (Admin, Dosen, Mahasiswa)

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'dosen', 'mahasiswa') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**Contoh Data:**
| id | name | email | role |
|----|------|-------|------|
| user-1 | Admin Sistem | admin@university.ac.id | admin |
| user-2 | Dr. Budi Santoso | budi@university.ac.id | dosen |
| user-3 | Ahmad Rizki | ahmad@university.ac.id | mahasiswa |

---

## 2. Tabel: rooms
Menyimpan data ruangan kuliah

```sql
CREATE TABLE rooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  building VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  facilities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_building (building)
);
```

**Contoh Data:**
| id | name | building | capacity |
|----|------|----------|----------|
| room-1 | A101 | Gedung A | 40 |
| room-2 | A102 | Gedung A | 40 |
| room-3 | Lab 1 | Gedung Lab | 25 |

---

## 3. Tabel: courses (Mata Kuliah)
Menyimpan data mata kuliah

```sql
CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  lecturer_id VARCHAR(36),
  semester INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_semester (semester)
);
```

**Contoh Data:**
| id | code | name | credits | lecturer_id |
|----|------|------|---------|-------------|
| course-1 | CS101 | Pemrograman Dasar | 3 | user-2 |
| course-2 | CS102 | Struktur Data | 3 | user-2 |
| course-3 | MTK101 | Kalkulus I | 3 | user-2 |

---

## 4. Tabel: schedules (Jadwal)
Menyimpan data jadwal kuliah

```sql
CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  room_id VARCHAR(36) NOT NULL,
  day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  semester VARCHAR(20),
  academic_year VARCHAR(20),
  has_conflict BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_day (day),
  INDEX idx_room_day (room_id, day),
  INDEX idx_conflict (has_conflict)
);
```

**Contoh Data:**
| id | course_id | room_id | day | start_time | end_time | has_conflict |
|----|-----------|---------|-----|------------|----------|--------------|
| sch-1 | course-1 | room-1 | Monday | 07:00 | 09:00 | FALSE |
| sch-2 | course-2 | room-1 | Monday | 08:00 | 10:00 | TRUE |

---

## 5. Tabel: schedule_conflicts (Log Bentrok)
Menyimpan log jadwal yang bentrok untuk audit

```sql
CREATE TABLE schedule_conflicts (
  id VARCHAR(36) PRIMARY KEY,
  schedule_id_1 VARCHAR(36) NOT NULL,
  schedule_id_2 VARCHAR(36) NOT NULL,
  conflict_type ENUM('room_overlap', 'lecturer_overlap') NOT NULL,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (schedule_id_1) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id_2) REFERENCES schedules(id) ON DELETE CASCADE,
  INDEX idx_detected_at (detected_at),
  INDEX idx_resolved (resolved)
);
```

---

## Relasi Antar Tabel

```
users (1) -----> (N) courses
  |
  | (lecturer_id)
  |
  v

rooms (1) -----> (N) schedules
  |
  | (room_id)
  |
  v

courses (1) -----> (N) schedules
  |
  | (course_id)
  |
  v

schedules (1) -----> (N) schedule_conflicts
```

---

## Query Penting

### 1. Cek Jadwal Bentrok di Ruangan yang Sama
```sql
SELECT 
  s1.id as schedule_1,
  s2.id as schedule_2,
  s1.day,
  s1.start_time,
  s1.end_time,
  r.name as room_name
FROM schedules s1
JOIN schedules s2 ON s1.day = s2.day 
  AND s1.room_id = s2.room_id 
  AND s1.id != s2.id
JOIN rooms r ON s1.room_id = r.id
WHERE s1.start_time < s2.end_time 
  AND s1.end_time > s2.start_time;
```

### 2. Ambil Jadwal Lengkap dengan Detail
```sql
SELECT 
  s.id,
  s.day,
  s.start_time,
  s.end_time,
  c.code as course_code,
  c.name as course_name,
  r.name as room_name,
  r.building,
  u.name as lecturer_name,
  s.has_conflict
FROM schedules s
JOIN courses c ON s.course_id = c.id
JOIN rooms r ON s.room_id = r.id
LEFT JOIN users u ON c.lecturer_id = u.id
ORDER BY s.day, s.start_time;
```

### 3. Hitung Statistik Jadwal
```sql
SELECT 
  COUNT(*) as total_schedules,
  SUM(CASE WHEN has_conflict = TRUE THEN 1 ELSE 0 END) as conflicted_schedules,
  COUNT(DISTINCT room_id) as rooms_used,
  COUNT(DISTINCT course_id) as courses_scheduled
FROM schedules;
```

---

## Indexes untuk Optimasi

```sql
-- Index untuk pencarian cepat berdasarkan hari dan ruangan
CREATE INDEX idx_day_room ON schedules(day, room_id);

-- Index untuk pencarian berdasarkan waktu
CREATE INDEX idx_time_range ON schedules(start_time, end_time);

-- Index komposit untuk deteksi bentrok
CREATE INDEX idx_conflict_detection ON schedules(day, room_id, start_time, end_time);
```

---

## Catatan Implementasi Supabase

Jika menggunakan Supabase, tambahkan:

1. **Row Level Security (RLS)**
```sql
-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policy untuk Admin (full access)
CREATE POLICY admin_all ON schedules 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policy untuk Dosen (read only)
CREATE POLICY dosen_read ON schedules 
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'dosen');

-- Policy untuk Mahasiswa (read only)
CREATE POLICY mahasiswa_read ON schedules 
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'mahasiswa');
```

2. **Realtime Subscriptions**
```javascript
// Subscribe to changes in schedules table
supabase
  .channel('schedules-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'schedules' },
    (payload) => {
      console.log('Change detected:', payload);
    }
  )
  .subscribe();
```
