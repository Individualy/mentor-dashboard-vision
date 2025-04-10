import { HMSActions } from '@100mslive/react-sdk';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Room configuration
export const ROOM_ID = 'nqe-mzvq-zzm';
export const TOKEN_ENDPOINT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiYXBwIiwiYXBwX2RhdGEiOm51bGwsImFjY2Vzc19rZXkiOiI2N2Y2OGQ4MzMzY2U3NGFiOWJlOTViYzAiLCJyb2xlIjoiaG9zdCIsInJvb21faWQiOiI2N2Y2OGU0MzM2ZDRjZmMxOTgxZjE5MTciLCJ1c2VyX2lkIjoiMzcwNjZmNjMtZWUxYS00NmZiLTg1M2QtZmM0NzQ3ZjQ3NTE0IiwiZXhwIjoxNzQ0Mjk4MDQ5LCJqdGkiOiIxNWYxZTQyOS0yNWFlLTRiOTMtODk2OC00N2NjYTAwY2Q1YTYiLCJpYXQiOjE3NDQyMTE2NDksImlzcyI6IjY3ZjY4ZDgzMzNjZTc0YWI5YmU5NWJiZSIsIm5iZiI6MTc0NDIxMTY0OSwic3ViIjoiYXBpIn0.fx0ezpYYNuir70kjiPnrFzlbwiEtBXvzbM27z-ODlqc';

// In-memory storage for newly created meetings
const createdMeetings: Meeting[] = [];

// Interface for meeting data
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  room_id: string;
  created_by: string;
  created_at: string;
}

// Function to get auth token for 100ms
export const get100msToken = async (role: string = 'host'): Promise<string> => {
  try {
    // In a production environment, you would fetch this from your backend
    // For now, we'll use the provided token
    return TOKEN_ENDPOINT;
  } catch (error) {
    console.error('Error getting 100ms token:', error);
    throw error;
  }
};

// Function to create a new meeting
export const createMeeting = async (
  token: string,
  title: string,
  description: string = '',
  startTime: string,
  endTime: string
): Promise<Meeting> => {
  try {
    // In a real implementation, you would call your backend to create a meeting
    // For now, we'll create a mock meeting
    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      room_id: ROOM_ID,
      created_by: 'current-user',
      created_at: new Date().toISOString()
    };

    // Store the meeting in our in-memory storage
    createdMeetings.push(meeting);
    console.log('Created new meeting:', meeting);
    console.log('Current created meetings:', createdMeetings);

    return meeting;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Function to get all meetings
export const getMeetings = async (token: string): Promise<Meeting[]> => {
  try {
    // In a real implementation, you would call your backend to get meetings
    // For now, we'll return mock meetings
    const now = new Date();
    const mockMeetings: Meeting[] = [
      {
        id: 'meeting-1',
        title: 'Math Class',
        description: 'Weekly math class session',
        start_time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        room_id: ROOM_ID,
        created_by: 'teacher-1',
        created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'meeting-2',
        title: 'Science Lab',
        description: 'Virtual science lab session',
        start_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 120 * 60 * 1000).toISOString(),
        room_id: ROOM_ID,
        created_by: 'teacher-2',
        created_at: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'meeting-3',
        title: 'History Discussion',
        description: 'Discussion about World War II',
        start_time: new Date(now.getTime() + 180 * 60 * 1000).toISOString(),
        end_time: new Date(now.getTime() + 240 * 60 * 1000).toISOString(),
        room_id: ROOM_ID,
        created_by: 'teacher-3',
        created_at: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Combine mock meetings with newly created meetings
    const allMeetings = [...mockMeetings, ...createdMeetings];
    console.log('All meetings:', allMeetings);

    return allMeetings;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};



// Function to get a meeting by ID
export const getMeetingById = async (token: string, meetingId: string): Promise<Meeting | null> => {
  try {
    console.log('Looking for meeting with ID:', meetingId);

    // First check our in-memory storage for newly created meetings
    const createdMeeting = createdMeetings.find(meeting => meeting.id === meetingId);
    if (createdMeeting) {
      console.log('Found meeting in created meetings:', createdMeeting);
      return createdMeeting;
    }

    // Then check the mock meetings
    const meetings = await getMeetings(token);
    const existingMeeting = meetings.find(meeting => meeting.id === meetingId);

    if (existingMeeting) {
      console.log('Found meeting in existing meetings:', existingMeeting);
      return existingMeeting;
    }

    console.log('Meeting not found');
    return null;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    throw error;
  }
};

// Function to join a meeting
export const joinMeeting = async (
  hmsActions: HMSActions,
  userName: string,
  role: string = 'host'
): Promise<void> => {
  try {
    const token = await get100msToken(role);

    await hmsActions.join({
      userName,
      authToken: token,
      settings: {
        isAudioMuted: true,
        isVideoMuted: false,
      },
      metaData: JSON.stringify({
        role
      }),
    });

    console.log('Successfully joined the meeting');
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

// Function to send a chat message
export const sendChatMessage = async (
  hmsActions: HMSActions,
  message: string,
  type: 'group' | 'private' = 'group',
  recipientPeerId?: string
): Promise<void> => {
  try {
    if (type === 'group') {
      await hmsActions.sendBroadcastMessage(message);
    } else if (type === 'private' && recipientPeerId) {
      await hmsActions.sendDirectMessage(message, recipientPeerId);
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// Function to toggle audio
export const toggleAudio = async (
  hmsActions: HMSActions,
  enabled: boolean
): Promise<void> => {
  try {
    await hmsActions.setLocalAudioEnabled(enabled);
  } catch (error) {
    console.error('Error toggling audio:', error);
    throw error;
  }
};

// Function to toggle video
export const toggleVideo = async (
  hmsActions: HMSActions,
  enabled: boolean
): Promise<void> => {
  try {
    await hmsActions.setLocalVideoEnabled(enabled);
  } catch (error) {
    console.error('Error toggling video:', error);
    throw error;
  }
};

// Function to toggle screen sharing
export const toggleScreenShare = async (
  hmsActions: HMSActions,
  enabled: boolean
): Promise<void> => {
  try {
    await hmsActions.setScreenShareEnabled(enabled);
  } catch (error) {
    console.error('Error toggling screen share:', error);
    throw error;
  }
};

// Function to leave a meeting
export const leaveMeeting = async (
  hmsActions: HMSActions
): Promise<void> => {
  try {
    await hmsActions.leave();
  } catch (error) {
    console.error('Error leaving meeting:', error);
    throw error;
  }
};
