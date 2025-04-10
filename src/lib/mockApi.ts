import { Meeting } from './api';

// Mock storage for meetings
let mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Math Class',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    link: 'https://meet.google.com/mock-meeting-1',
    duration: '1 hour',
    class_id: 1
  },
  {
    id: '2',
    title: 'Science Lab',
    start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    end_time: new Date(Date.now() + 120 * 60 * 1000).toISOString(), // 2 hours from now
    link: 'https://meet.google.com/mock-meeting-2',
    duration: '1 hour',
    class_id: 2
  }
];

// Mock API functions
export const mockCreateMeeting = async (
  title: string, 
  startTime: string, 
  endTime: string, 
  classId: number
): Promise<Meeting> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Create a new meeting
  const newMeeting: Meeting = {
    id: String(Date.now()), // Use timestamp as ID
    title,
    start_time: startTime,
    end_time: endTime,
    link: `https://meet.google.com/mock-meeting-${Date.now()}`,
    duration: '1 hour',
    class_id: classId
  };
  
  // Add to mock storage
  mockMeetings.push(newMeeting);
  console.log('Mock meeting created:', newMeeting);
  
  return newMeeting;
};

export const mockGetMeetings = async (): Promise<Meeting[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockMeetings;
};

export const mockGetMeetingById = async (id: string | number): Promise<Meeting | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const meeting = mockMeetings.find(m => String(m.id) === String(id));
  return meeting || null;
};

export const mockGet100msToken = async (): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return a mock token
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiYXBwIiwiYXBwX2RhdGEiOm51bGwsImFjY2Vzc19rZXkiOiI2N2Y2OGQ4MzMzY2U3NGFiOWJlOTViYzAiLCJyb2xlIjoiaG9zdCIsInJvb21faWQiOiI2N2Y2OGU0MzM2ZDRjZmMxOTgxZjE5MTciLCJ1c2VyX2lkIjoiMzcwNjZmNjMtZWUxYS00NmZiLTg1M2QtZmM0NzQ3ZjQ3NTE0IiwiZXhwIjoxNzQ0Mjk4MDQ5LCJqdGkiOiIxNWYxZTQyOS0yNWFlLTRiOTMtODk2OC00N2NjYTAwY2Q1YTYiLCJpYXQiOjE3NDQyMTE2NDksImlzcyI6IjY3ZjY4ZDgzMzNjZTc0YWI5YmU5NWJiZSIsIm5iZiI6MTc0NDIxMTY0OSwic3ViIjoiYXBpIn0.fx0ezpYYNuir70kjiPnrFzlbwiEtBXvzbM27z-ODlqc';
};
