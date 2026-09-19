// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ClassEntry, AttendanceRecord , AttendanceStatus} from '@/types';
import { StorageService } from '@/services/storage';
import { getTodayString } from '@/services/timetableUtils';

interface TimetableContextType {
  classes: ClassEntry[];
  attendance: AttendanceRecord[];
  isLoading: boolean;
  markAttendance: (classId: string, status: AttendanceStatus, date?: string) => void;
  addClass: (cls: Omit<ClassEntry, 'id'>) => void;
  updateClass: (id: string, updates: Partial<ClassEntry>) => void;
  deleteClass: (id: string) => void;
  cancelClass: (id: string) => void;
  restoreClass: (id: string) => void;
}

export const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [cls, att] = await Promise.all([
        StorageService.getTimetable(),
        StorageService.getAttendance(),
      ]);
      setClasses(cls);
      setAttendance(att);
      setIsLoading(false);
    })();
  }, []);

  const saveClasses = useCallback(async (updated: ClassEntry[]) => {
    setClasses(updated);
    await StorageService.saveTimetable(updated);
  }, []);

  const saveAttendance = useCallback(async (updated: AttendanceRecord[]) => {
    setAttendance(updated);
    await StorageService.saveAttendance(updated);
  }, []);

  const markAttendance = useCallback((classId: string, status: AttendanceStatus, date?: string) => {
    const recordDate = date || getTodayString();
    setAttendance(prev => {
      let updated: AttendanceRecord[];
      
      // 👈 Added logic to remove the record if 'none' is passed
      if (status === 'none') {
        updated = prev.filter(r => !(r.classId === classId && r.date === recordDate));
      } else {
        const existing = prev.find(r => r.classId === classId && r.date === recordDate);
        if (existing) {
          updated = prev.map(r =>
            r.classId === classId && r.date === recordDate ? { ...r, status } : r
          );
        } else {
          updated = [...prev, {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            classId,
            date: recordDate,
            status,
          }];
        }
      }
      
      StorageService.saveAttendance(updated);
      return updated;
    });
  }, []);

  const addClass = useCallback((cls: Omit<ClassEntry, 'id'>) => {
    const newClass: ClassEntry = {
      ...cls,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
    saveClasses([...classes, newClass]);
  }, [classes, saveClasses]);

  const updateClass = useCallback((id: string, updates: Partial<ClassEntry>) => {
    const updated = classes.map(c => c.id === id ? { ...c, ...updates } : c);
    saveClasses(updated);
  }, [classes, saveClasses]);

  const deleteClass = useCallback((id: string) => {
    saveClasses(classes.filter(c => c.id !== id));
  }, [classes, saveClasses]);

  const cancelClass = useCallback((id: string) => {
    const updated = classes.map(c => c.id === id ? { ...c, isCancelled: true } : c);
    saveClasses(updated);
  }, [classes, saveClasses]);

  const restoreClass = useCallback((id: string) => {
    const updated = classes.map(c => c.id === id ? { ...c, isCancelled: false } : c);
    saveClasses(updated);
  }, [classes, saveClasses]);

  return (
    <TimetableContext.Provider value={{
      classes, attendance, isLoading,
      markAttendance, addClass, updateClass, deleteClass, cancelClass, restoreClass,
    }}>
      {children}
    </TimetableContext.Provider>
  );
}
