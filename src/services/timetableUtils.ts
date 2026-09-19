// Powered by OnSpace.AI
import { ClassEntry, AttendanceRecord, AttendanceStatus } from '@/types';
import { Colors } from '@/constants/theme';

export function getTodayDayIndex(): number {
  const jsDay = new Date().getDay(); // 0 = Sunday
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to Mon=0
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getClassesForDay(classes: ClassEntry[], dayIndex: number, date?: string): ClassEntry[] {
  return classes
    .filter(c => {
      if (c.isCancelled) return false;
      if (c.isExtra && c.extraDate) {
        return date ? c.extraDate === date : false;
      }
      return c.day === dayIndex;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getAttendanceForClass(
  attendance: AttendanceRecord[],
  classId: string,
  date: string
): AttendanceStatus {
  const record = attendance.find(r => r.classId === classId && r.date === date);
  return record ? record.status : 'none';
}

export function getAttendanceStats(
  classes: ClassEntry[],
  attendance: AttendanceRecord[]
) {
  // Group by courseCode
  const courseMap: Record<string, { code: string; name: string; colorIndex: number; total: number; present: number; absent: number }> = {};

  // Build course map from recurring classes
  classes.filter(c => !c.isExtra).forEach(c => {
    if (!courseMap[c.courseCode]) {
      courseMap[c.courseCode] = { code: c.courseCode, name: c.courseName, colorIndex: c.colorIndex, total: 0, present: 0, absent: 0 };
    }
  });

  // Count attendance
  attendance.forEach(record => {
    const cls = classes.find(c => c.id === record.classId);
    if (!cls) return;
    const entry = courseMap[cls.courseCode];
    if (!entry) return;
    entry.total++;
    if (record.status === 'present') entry.present++;
    else entry.absent++;
  });

  return Object.values(courseMap).filter(c => c.total > 0);
}

export function getSubjectColor(colorIndex: number): string {
  return Colors.subjectColors[colorIndex % Colors.subjectColors.length];
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getWeekDates(offset = 0): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}
