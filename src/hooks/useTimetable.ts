// Powered by OnSpace.AI
import { useContext } from 'react';
import { TimetableContext } from '@/contexts/TimetableContext';

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) throw new Error('useTimetable must be used within TimetableProvider');
  return context;
}
