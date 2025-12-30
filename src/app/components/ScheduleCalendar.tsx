import React from 'react';
import { Schedule } from '../types/schedule';
import { Edit, Trash2, Clock } from 'lucide-react';

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  onEdit,
  onDelete,
}) => {
  const getSchedulesForDayAndTime = (day: string, time: string) => {
    return schedules.filter((schedule) => {
      const scheduleStart = parseInt(schedule.startTime.split(':')[0]);
      const slotTime = parseInt(time.split(':')[0]);
      const scheduleEnd = parseInt(schedule.endTime.split(':')[0]);

      return (
        schedule.day === day &&
        slotTime >= scheduleStart &&
        slotTime < scheduleEnd
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-auto">
      <div className="min-w-[1000px]">
        {/* Header */}
        <div className="grid grid-cols-6 border-b">
          <div className="p-4 bg-gray-50 text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Waktu
          </div>
          {DAYS.map((day) => (
            <div key={day} className="p-4 bg-gray-50 text-gray-700 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-6 border-b min-h-[80px]">
            <div className="p-4 bg-gray-50 text-gray-600 flex items-start">
              {time}
            </div>
            {DAYS.map((day) => {
              const daySchedules = getSchedulesForDayAndTime(day, time);
              return (
                <div
                  key={`${day}-${time}`}
                  className="p-2 border-l relative"
                >
                  {daySchedules.map((schedule) => {
                    // Only render if this is the start time
                    if (schedule.startTime === time) {
                      const duration =
                        parseInt(schedule.endTime.split(':')[0]) -
                        parseInt(schedule.startTime.split(':')[0]);
                      const height = duration * 80;

                      return (
                        <div
                          key={schedule.id}
                          className={`absolute left-2 right-2 rounded p-2 ${
                            schedule.hasConflict
                              ? 'bg-red-100 border-2 border-red-500'
                              : 'bg-blue-100 border-2 border-blue-500'
                          }`}
                          style={{
                            height: `${height - 8}px`,
                            zIndex: schedule.hasConflict ? 20 : 10,
                          }}
                        >
                          <div className="text-gray-900 mb-1">
                            {schedule.courseCode}
                          </div>
                          <div className="text-gray-700 mb-1">
                            {schedule.courseName}
                          </div>
                          <div className="text-gray-600 mb-1">
                            {schedule.roomName}
                          </div>
                          <div className="text-gray-600">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          {schedule.hasConflict && (
                            <div className="text-red-600 mt-1">
                              ⚠️ Bentrok
                            </div>
                          )}
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => onEdit(schedule)}
                              className="p-1 bg-white rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit className="w-3 h-3 text-blue-600" />
                            </button>
                            <button
                              onClick={() => onDelete(schedule.id)}
                              className="p-1 bg-white rounded hover:bg-gray-100"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
