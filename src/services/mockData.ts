// Powered by OnSpace.AI
import { ClassEntry } from '@/types';

export const DEFAULT_TIMETABLE: ClassEntry[] = [
  // Monday
  { id: 'c1', courseCode: 'CS301', courseName: 'Data Structures', facultyName: 'Dr. Sharma', day: 0, startTime: '09:00', endTime: '10:00', colorIndex: 0, room: 'A-101' },
  { id: 'c2', courseCode: 'MATH201', courseName: 'Linear Algebra', facultyName: 'Prof. Gupta', day: 0, startTime: '10:15', endTime: '11:15', colorIndex: 1, room: 'B-204' },
  { id: 'c3', courseCode: 'CS302', courseName: 'Operating Systems', facultyName: 'Dr. Mehta', day: 0, startTime: '14:00', endTime: '15:00', colorIndex: 2, room: 'A-103' },

  // Tuesday
  { id: 'c4', courseCode: 'CS303', courseName: 'Computer Networks', facultyName: 'Prof. Singh', day: 1, startTime: '09:00', endTime: '10:00', colorIndex: 3, room: 'Lab-2' },
  { id: 'c5', courseCode: 'CS304', courseName: 'Database Systems', facultyName: 'Dr. Patel', day: 1, startTime: '11:00', endTime: '12:00', colorIndex: 4, room: 'C-301' },

  // Wednesday
  { id: 'c6', courseCode: 'CS301', courseName: 'Data Structures', facultyName: 'Dr. Sharma', day: 2, startTime: '09:00', endTime: '10:00', colorIndex: 0, room: 'A-101' },
  { id: 'c7', courseCode: 'MATH201', courseName: 'Linear Algebra', facultyName: 'Prof. Gupta', day: 2, startTime: '10:15', endTime: '11:15', colorIndex: 1, room: 'B-204' },
  { id: 'c8', courseCode: 'CS305', courseName: 'Software Engineering', facultyName: 'Dr. Joshi', day: 2, startTime: '13:00', endTime: '14:00', colorIndex: 5, room: 'A-205' },

  // Thursday
  { id: 'c9', courseCode: 'CS302', courseName: 'Operating Systems', facultyName: 'Dr. Mehta', day: 3, startTime: '09:00', endTime: '10:00', colorIndex: 2, room: 'A-103' },
  { id: 'c10', courseCode: 'CS303', courseName: 'Computer Networks', facultyName: 'Prof. Singh', day: 3, startTime: '11:00', endTime: '12:00', colorIndex: 3, room: 'Lab-2' },

  // Friday
  { id: 'c11', courseCode: 'CS304', courseName: 'Database Systems', facultyName: 'Dr. Patel', day: 4, startTime: '09:00', endTime: '10:00', colorIndex: 4, room: 'C-301' },
  { id: 'c12', courseCode: 'CS305', courseName: 'Software Engineering', facultyName: 'Dr. Joshi', day: 4, startTime: '10:15', endTime: '11:15', colorIndex: 5, room: 'A-205' },
  { id: 'c13', courseCode: 'CS306', courseName: 'Theory of Computation', facultyName: 'Prof. Kumar', day: 4, startTime: '14:00', endTime: '15:00', colorIndex: 6, room: 'B-102' },

  // Saturday
  { id: 'c14', courseCode: 'CS306', courseName: 'Theory of Computation', facultyName: 'Prof. Kumar', day: 5, startTime: '10:00', endTime: '11:00', colorIndex: 6, room: 'B-102' },
];
