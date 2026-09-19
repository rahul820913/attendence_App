// Powered by OnSpace.AI

export interface ClassEntry {
    id: string;
    courseCode: string;
    courseName: string;
    facultyName: string;
    day: number; // 0 = Monday ... 6 = Sunday
    startTime: string; // "09:00"
    endTime: string;   // "10:00"
    colorIndex: number;
    room?: string;
    isExtra?: boolean;
    isCancelled?: boolean;
    extraDate?: string; 
  }
  
  export interface AttendanceRecord {
    id: string;
    classId: string;
    date: string; // "YYYY-MM-DD"
    status: AttendanceStatus;
  }
  
  export interface TimetableState {
    classes: ClassEntry[];
    attendance: AttendanceRecord[];
  }
  
  export type AttendanceStatus = 'present' | 'absent' | 'upcoming' | 'none';
  