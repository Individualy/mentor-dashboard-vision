
import React, { useEffect, useState } from 'react';
import {
  selectPeers,
  useHMSActions,
  useHMSStore,
  HMSRoomProvider,
} from '@100mslive/react-sdk';
import {
  ConferenceScreen,
  MeetingIdScreen,
  leaveRoom,
} from '@100mslive/roomkit-react';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  link: string;
  duration: string;
  class_id: number;
}

interface VideoConferenceProps {
  meeting: Meeting;
  onLeaveMeeting: () => void;
  role: 'host' | 'participant';
}

// This is the component that wraps the HMS provider
const VideoConferenceWrapper: React.FC<VideoConferenceProps> = ({
  meeting,
  onLeaveMeeting,
  role
}) => {
  return (
    <HMSRoomProvider>
      <VideoConferenceInner 
        meeting={meeting} 
        onLeaveMeeting={onLeaveMeeting}
        role={role} 
      />
    </HMSRoomProvider>
  );
};

// This is the inner component that uses the HMS hooks
const VideoConferenceInner: React.FC<VideoConferenceProps> = ({
  meeting,
  onLeaveMeeting,
  role
}) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);

  useEffect(() => {
    // In a real implementation, you would fetch the room code from your backend
    // based on the meeting ID. For now, we'll use a placeholder.
    const fetchRoomCode = async () => {
      try {
        // This is a placeholder, in a real app you would call your API
        // The room code would be generated on your backend using the 100ms API
        const mockRoomCode = "abc-xyz-123";
        setRoomCode(mockRoomCode);
      } catch (error) {
        console.error("Error fetching room code:", error);
        toast.error("Failed to fetch room code");
      }
    };

    fetchRoomCode();
  }, [meeting.id]);

  const joinRoom = async () => {
    if (!roomCode) {
      toast.error("Room code not available");
      return;
    }

    setIsJoining(true);
    try {
      // In a real implementation, you would use the actual room code
      // and token from your backend
      await hmsActions.join({
        userName: role === 'host' ? 'Teacher' : 'Student',
        authToken: '<YOUR_AUTH_TOKEN>', // This would come from your backend
        settings: {
          isAudioMuted: true,
          isVideoMuted: false,
        },
        metaData: JSON.stringify({
          role,
        }),
      });
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      await hmsActions.leave();
      onLeaveMeeting();
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div className="flex flex-col h-full">
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{meeting.title}</h1>
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Leave
          </button>
        </div>
        
        <div className="flex-1 relative">
          {/* This is just a placeholder. In a real implementation, you would use the 100ms UI components */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <p className="text-white text-xl">
              {isJoining ? (
                "Joining meeting..."
              ) : peers.length > 0 ? (
                `${peers.length} participants in the meeting`
              ) : (
                <button
                  onClick={joinRoom}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg transition-colors"
                >
                  Join Meeting
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceWrapper;
