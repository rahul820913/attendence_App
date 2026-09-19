// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassEntry, AttendanceRecord, TimetableState } from '@/types';
import { DEFAULT_TIMETABLE } from '@/services/mockData';

const KEYS = {
  TIMETABLE: 'timetable_classes',
  ATTENDANCE: 'attendance_records',
  SETUP_DONE: 'setup_done',
};

export const StorageService = {
  async getTimetable(): Promise<ClassEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.TIMETABLE);
      if (raw) return JSON.parse(raw);
      // First launch: seed with mock data
      await AsyncStorage.setItem(KEYS.TIMETABLE, JSON.stringify(DEFAULT_TIMETABLE));
      return DEFAULT_TIMETABLE;
    } catch {
      return DEFAULT_TIMETABLE;
    }
  },

  async saveTimetable(classes: ClassEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TIMETABLE, JSON.stringify(classes));
    } catch {}
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.ATTENDANCE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
    } catch {}
  },
};
