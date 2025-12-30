# 🚀 SUPABASE INTEGRATION GUIDE

Panduan lengkap untuk mengintegrasikan aplikasi penjadwalan kuliah dengan Supabase.

## 📋 Daftar Isi

1. [Setup Supabase Project](#setup-supabase-project)
2. [Database Schema](#database-schema)
3. [Row Level Security](#row-level-security)
4. [Authentication](#authentication)
5. [CRUD Operations](#crud-operations)
6. [Realtime Features](#realtime-features)
7. [Edge Functions](#edge-functions)

---

## 1. Setup Supabase Project

### Step 1: Buat Project Baru
1. Buka [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Isi detail project:
   - Name: `university-scheduling`
   - Database Password: (catat password ini)
   - Region: Southeast Asia (Singapore)

### Step 2: Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Step 3: Setup Environment Variables
Buat file `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 4: Buat Supabase Client
Buat file `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 2. Database Schema

### SQL untuk Membuat Tabel

Buka SQL Editor di Supabase Dashboard dan jalankan:

```sql
-- 1. TABEL USERS (extend dari auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dosen', 'mahasiswa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. TABEL ROOMS
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  building VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  facilities TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. TABEL COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  credits INT NOT NULL,
  lecturer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  semester INT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. TABEL SCHEDULES
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  semester VARCHAR(20),
  academic_year VARCHAR(20),
  has_conflict BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. TABEL SCHEDULE_CONFLICTS
CREATE TABLE public.schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id_1 UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  schedule_id_2 UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  conflict_type VARCHAR(50) NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- INDEXES untuk Performance
CREATE INDEX idx_schedules_day_room ON public.schedules(day, room_id);
CREATE INDEX idx_schedules_time ON public.schedules(start_time, end_time);
CREATE INDEX idx_schedules_conflict ON public.schedules(has_conflict);
CREATE INDEX idx_courses_code ON public.courses(code);
CREATE INDEX idx_users_role ON public.users(role);

-- TRIGGERS untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Insert Sample Data

```sql
-- Sample Rooms
INSERT INTO public.rooms (name, building, capacity) VALUES
  ('A101', 'Gedung A', 40),
  ('A102', 'Gedung A', 40),
  ('B201', 'Gedung B', 50),
  ('B202', 'Gedung B', 50),
  ('C301', 'Gedung C', 30),
  ('Lab 1', 'Gedung Lab', 25);

-- Sample Courses (lecturer_id akan diisi setelah user dibuat)
INSERT INTO public.courses (code, name, credits, semester) VALUES
  ('CS101', 'Pemrograman Dasar', 3, 1),
  ('CS102', 'Struktur Data', 3, 2),
  ('CS201', 'Algoritma', 3, 3),
  ('CS202', 'Basis Data', 3, 4),
  ('MTK101', 'Kalkulus I', 3, 1),
  ('MTK102', 'Aljabar Linear', 3, 2);
```

---

## 3. Row Level Security (RLS)

### Enable RLS pada Semua Tabel

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_conflicts ENABLE ROW LEVEL SECURITY;
```

### Policies untuk USERS Table

```sql
-- Admin: Full access
CREATE POLICY "Admin can do everything on users"
  ON public.users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data (except role)
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Policies untuk ROOMS Table

```sql
-- Everyone can read rooms
CREATE POLICY "Anyone can read rooms"
  ON public.rooms
  FOR SELECT
  USING (true);

-- Only admin can modify rooms
CREATE POLICY "Admin can modify rooms"
  ON public.rooms
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### Policies untuk COURSES Table

```sql
-- Everyone can read courses
CREATE POLICY "Anyone can read courses"
  ON public.courses
  FOR SELECT
  USING (true);

-- Admin and Dosen can create/update courses
CREATE POLICY "Admin and Dosen can modify courses"
  ON public.courses
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'dosen'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'dosen'
  );
```

### Policies untuk SCHEDULES Table

```sql
-- Everyone can read schedules
CREATE POLICY "Anyone can read schedules"
  ON public.schedules
  FOR SELECT
  USING (true);

-- Admin can do everything
CREATE POLICY "Admin can modify schedules"
  ON public.schedules
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Dosen can update schedules for their courses
CREATE POLICY "Dosen can update own schedules"
  ON public.schedules
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'dosen' AND
    course_id IN (
      SELECT id FROM public.courses 
      WHERE lecturer_id = auth.uid()
    )
  );
```

---

## 4. Authentication

### Setup Auth dengan Custom User Metadata

```typescript
// src/lib/auth.ts
import { supabase } from './supabase';

export const signUp = async (email: string, password: string, name: string, role: string) => {
  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      }
    }
  });

  if (authError) throw authError;

  // 2. Insert into public.users table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        role,
      });

    if (profileError) throw profileError;
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return { user: data.user, profile };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
};
```

### Update AuthContext untuk Supabase

```typescript
// src/app/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getCurrentUser } from '../../lib/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    getCurrentUser().then(data => {
      setUser(data?.profile);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { profile } = await getCurrentUser();
          setUser(profile);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { profile } = await signIn(email, password);
    setUser(profile);
    return true;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

---

## 5. CRUD Operations

### Read Schedules dengan Joins

```typescript
// src/lib/scheduleService.ts
import { supabase } from './supabase';

export const getSchedules = async () => {
  const { data, error } = await supabase
    .from('schedules')
    .select(`
      *,
      courses (
        code,
        name,
        lecturer:users(name)
      ),
      rooms (
        name,
        building
      )
    `)
    .order('day', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  // Transform data untuk match dengan frontend types
  return data.map(schedule => ({
    id: schedule.id,
    courseId: schedule.course_id,
    courseName: schedule.courses.name,
    courseCode: schedule.courses.code,
    roomId: schedule.room_id,
    roomName: schedule.rooms.name,
    day: schedule.day,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    lecturer: schedule.courses.lecturer?.name || '',
    hasConflict: schedule.has_conflict,
  }));
};
```

### Create Schedule

```typescript
export const createSchedule = async (scheduleData: {
  courseId: string;
  roomId: string;
  day: string;
  startTime: string;
  endTime: string;
}) => {
  const { data, error } = await supabase
    .from('schedules')
    .insert({
      course_id: scheduleData.courseId,
      room_id: scheduleData.roomId,
      day: scheduleData.day,
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Update Schedule

```typescript
export const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
  const { data, error } = await supabase
    .from('schedules')
    .update({
      day: updates.day,
      start_time: updates.startTime,
      end_time: updates.endTime,
      room_id: updates.roomId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Delete Schedule

```typescript
export const deleteSchedule = async (id: string) => {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
```

### Detect Conflicts dengan PostgreSQL Function

```sql
-- Buat function untuk detect conflicts
CREATE OR REPLACE FUNCTION detect_schedule_conflicts()
RETURNS TABLE (
  schedule_id UUID,
  conflicting_schedule_id UUID,
  conflict_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s1.id as schedule_id,
    s2.id as conflicting_schedule_id,
    'Room overlap' as conflict_reason
  FROM schedules s1
  JOIN schedules s2 
    ON s1.day = s2.day 
    AND s1.room_id = s2.room_id 
    AND s1.id < s2.id
  WHERE 
    s1.start_time < s2.end_time 
    AND s1.end_time > s2.start_time;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Call dari TypeScript
export const detectConflicts = async () => {
  const { data, error } = await supabase.rpc('detect_schedule_conflicts');
  
  if (error) throw error;
  return data;
};
```

---

## 6. Realtime Features

### Subscribe to Schedule Changes

```typescript
// src/hooks/useRealtimeSchedules.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSchedules } from '../lib/scheduleService';

export const useRealtimeSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadSchedules();

    // Subscribe to changes
    const channel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        (payload) => {
          console.log('Schedule changed:', payload);
          loadSchedules(); // Reload schedules
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    const data = await getSchedules();
    setSchedules(data);
    setLoading(false);
  };

  return { schedules, loading, refresh: loadSchedules };
};
```

### Usage in Component

```typescript
// src/pages/SchedulePage.tsx
import { useRealtimeSchedules } from '../hooks/useRealtimeSchedules';

export const SchedulePage = () => {
  const { schedules, loading, refresh } = useRealtimeSchedules();

  // Schedules akan auto-update ketika ada perubahan di database!
  
  return (
    <div>
      {loading ? 'Loading...' : (
        <ScheduleCalendar schedules={schedules} />
      )}
    </div>
  );
};
```

---

## 7. Edge Functions (Optional)

### Auto-Generate Schedule Function

Buat Supabase Edge Function untuk auto-generate:

```typescript
// supabase/functions/auto-generate-schedule/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get all courses that need scheduling
  const { data: courses } = await supabase
    .from('courses')
    .select('*');

  // Get all rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*');

  // Auto-generate logic
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { start: '07:00', end: '09:00' },
    { start: '09:00', end: '11:00' },
    { start: '11:00', end: '13:00' },
    { start: '13:00', end: '15:00' },
    { start: '15:00', end: '17:00' },
  ];

  const newSchedules = [];

  for (const course of courses) {
    let assigned = false;

    for (const day of days) {
      if (assigned) break;
      
      for (const slot of timeSlots) {
        if (assigned) break;
        
        for (const room of rooms) {
          // Check if slot is empty
          const { data: existing } = await supabase
            .from('schedules')
            .select('*')
            .eq('day', day)
            .eq('room_id', room.id)
            .gte('end_time', slot.start)
            .lte('start_time', slot.end);

          if (!existing || existing.length === 0) {
            newSchedules.push({
              course_id: course.id,
              room_id: room.id,
              day,
              start_time: slot.start,
              end_time: slot.end,
            });
            assigned = true;
            break;
          }
        }
      }
    }
  }

  // Insert all new schedules
  const { data, error } = await supabase
    .from('schedules')
    .insert(newSchedules);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  return new Response(JSON.stringify({ 
    success: true, 
    generated: newSchedules.length 
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

### Call Edge Function dari Frontend

```typescript
export const autoGenerateSchedule = async () => {
  const { data, error } = await supabase.functions.invoke('auto-generate-schedule');
  
  if (error) throw error;
  return data;
};
```

---

## 🔐 Security Best Practices

1. **Never expose Service Role Key di frontend**
   - Gunakan hanya untuk Edge Functions atau server-side code

2. **Use RLS untuk semua tabel**
   - Pastikan setiap tabel memiliki policies yang tepat

3. **Validate input di backend**
   - Gunakan Edge Functions atau Database Functions untuk business logic

4. **Use prepared statements**
   - Hindari SQL injection dengan menggunakan Supabase client

5. **Monitor logs**
   - Check Supabase Dashboard untuk suspicious activities

---

## 📊 Performance Tips

1. **Use Indexes**
   ```sql
   CREATE INDEX idx_schedules_composite 
   ON schedules(day, room_id, start_time, end_time);
   ```

2. **Batch Operations**
   ```typescript
   // Bad: Multiple queries
   for (const schedule of schedules) {
     await supabase.from('schedules').insert(schedule);
   }

   // Good: Single batch insert
   await supabase.from('schedules').insert(schedules);
   ```

3. **Use Select Specific Columns**
   ```typescript
   // Bad: Get all columns
   .select('*')

   // Good: Get only needed columns
   .select('id, day, start_time, end_time')
   ```

4. **Pagination untuk Large Datasets**
   ```typescript
   const { data } = await supabase
     .from('schedules')
     .select('*')
     .range(0, 9); // Get first 10 records
   ```

---

## 🎯 Deployment Checklist

- [ ] Database schema created
- [ ] RLS policies configured
- [ ] Indexes created
- [ ] Sample data inserted
- [ ] Environment variables set
- [ ] Auth flow tested
- [ ] CRUD operations tested
- [ ] Realtime subscriptions working
- [ ] Edge functions deployed (if used)
- [ ] Security audit completed

---

## 📞 Troubleshooting

### Error: "Row Level Security is enabled but no policy allows this operation"
**Solution:** Periksa RLS policies, pastikan user memiliki permission yang sesuai.

### Error: "Foreign key constraint violation"
**Solution:** Pastikan data yang di-reference sudah ada di tabel parent.

### Realtime tidak update
**Solution:** 
1. Check subscription di Supabase Dashboard
2. Pastikan RLS policy allow SELECT
3. Check browser console untuk errors

---

**🎉 Selamat! Aplikasi Anda sekarang terhubung dengan Supabase!**
