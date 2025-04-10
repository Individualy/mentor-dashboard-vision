import React, { useEffect, useState, useRef } from 'react';
import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
  HMSRoomProvider,
  selectPeers,
  selectLocalPeer,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectIsSomeoneScreenSharing,
  selectScreenShareByPeerID,
  selectHMSMessages
} from '@100mslive/react-sdk';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { Meeting } from '@/lib/api';
import { joinMeeting, toggleAudio, toggleVideo, toggleScreenShare, leaveMeeting, getMeetingById, get100msToken, ROOM_ID } from '@/lib/100msService';
import { toast } from 'sonner';
import { Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare, PhoneOff, Users, MessageSquare } from 'lucide-react';

// Component to render a single video tile
const VideoTile = ({ peer, isLocal = false }: { peer: any, isLocal?: boolean }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'bad'>('good');

  // Update peer status
  useEffect(() => {
    if (!peer) return;

    setIsVideoEnabled(peer.videoEnabled !== false);
    setIsAudioEnabled(peer.audioEnabled !== false);
    setIsScreenSharing(!!peer.isScreenSharing);

    // Set connection quality based on available info
    if (peer.connectionQuality) {
      setConnectionQuality(peer.connectionQuality);
    }
  }, [peer]);

  // Handle video track attachment
  useEffect(() => {
    if (!videoRef.current) return;

    if (isLocal) {
      // For local video, we need to mirror it
      videoRef.current.style.transform = 'scaleX(-1)';
    }

    // Safely attach the video track to the video element
    const attachTrack = () => {
      try {
        if (peer?.videoTrack) {
          const videoTrack = peer.videoTrack;

          if (videoTrack?.nativeTrack) {
            try {
              // Create a new MediaStream with the native track
              const stream = new MediaStream();
              stream.addTrack(videoTrack.nativeTrack);

              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasVideo(true);
              }
            } catch (err) {
              console.error('Error creating MediaStream with native track:', err);
              // Fallback to direct stream if available
              if (videoTrack.stream && videoRef.current) {
                videoRef.current.srcObject = videoTrack.stream;
                setHasVideo(true);
              }
            }
          } else if (videoTrack?.stream) {
            // If there's already a stream, use it directly
            if (videoRef.current) {
              videoRef.current.srcObject = videoTrack.stream;
              setHasVideo(true);
            }
          } else {
            console.log('No valid video track found for peer:', peer.name);
            setHasVideo(false);
          }
        } else {
          setHasVideo(false);
        }
      } catch (error) {
        console.error('Error attaching video track:', error);
        setHasVideo(false);
      }
    };

    attachTrack();

    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [peer, isLocal]);

  // Get connection quality indicator
  const getConnectionIndicator = () => {
    switch (connectionQuality) {
      case 'good':
        return <div className="h-2 w-2 rounded-full bg-green-500 mr-1" title="Good connection" />;
      case 'poor':
        return <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1" title="Poor connection" />;
      case 'bad':
        return <div className="h-2 w-2 rounded-full bg-red-500 mr-1" title="Bad connection" />;
      default:
        return null;
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${isScreenSharing ? 'col-span-2 row-span-2' : ''}`}>
      {hasVideo && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full aspect-video bg-gray-800">
          <div className="text-white text-center">
            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-semibold">
                {peer?.name ? peer.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <p className="font-medium">{peer?.name || 'Participant'}</p>
            <p className="text-sm text-gray-400 mt-1">
              {isScreenSharing ? 'Screen sharing' : 'Camera off'}
            </p>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 px-3 py-2 rounded-md text-white text-sm flex items-center justify-between">
        <div className="flex items-center">
          {getConnectionIndicator()}
          <span className="truncate max-w-[150px]">{peer?.name || 'Participant'}</span>
          {isLocal && <span className="ml-1">(You)</span>}
        </div>
        <div className="flex items-center space-x-1">
          {isScreenSharing && <ScreenShare className="h-4 w-4 text-blue-400" />}
          {!isAudioEnabled && <MicOff className="h-4 w-4 text-red-400" />}
          {!isVideoEnabled && <VideoOff className="h-4 w-4 text-red-400" />}
        </div>
      </div>
    </div>
  );
};

// Component for the actual meeting room content
const MeetingRoomContent = () => {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const isSomeoneScreenSharing = useHMSStore(selectIsSomeoneScreenSharing);
  const screenSharePeer = useHMSStore(selectScreenShareByPeerID);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useUser();
  const [isJoining, setIsJoining] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<Meeting | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, message: string, time: string}>>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'starting' | 'recording' | 'stopping' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{audio: string | null, video: string | null}>({audio: null, video: null});
  const [availableDevices, setAvailableDevices] = useState<{audio: MediaDeviceInfo[], video: MediaDeviceInfo[]}>({audio: [], video: []});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // All useEffect hooks must be called in the same order on every render
  // Effect to get available devices when component mounts
  useEffect(() => {
    if (isConnected) {
      getAvailableDevices();
    }
  }, [isConnected]);

  // Effect to scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Get the meeting ID from URL parameters or use the default
  const meetingId = searchParams.get('id');

  // Fetch meeting information
  useEffect(() => {
    const fetchMeetingInfo = async () => {
      console.log('Fetching meeting info with ID:', meetingId);
      console.log('Token available:', !!token);

      if (!token) {
        console.log('No token available, waiting...');
        return;
      }

      if (!meetingId) {
        console.log('No meeting ID provided, using default meeting');
        // Create a default meeting info object if no meeting ID is provided
        const defaultMeeting: Meeting = {
          id: 'default-meeting',
          title: '100ms Meeting Room',
          description: 'Default meeting room',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          room_id: ROOM_ID,
          created_by: user?.full_name || 'Anonymous',
          created_at: new Date().toISOString()
        };

        setMeetingInfo(defaultMeeting);
        return;
      }

      try {
        // Fetch meeting information from the API
        console.log('Fetching meeting with ID:', meetingId);
        const meeting = await getMeetingById(token, meetingId);

        if (meeting) {
          console.log('Meeting found:', meeting);
          setMeetingInfo(meeting);
        } else {
          console.error('Meeting not found with ID:', meetingId);
          toast.error('Meeting not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching meeting info:', error);
        toast.error('Failed to load meeting information');
      }
    };

    fetchMeetingInfo();

    // Add some initial chat messages for testing
    setChatMessages([
      {
        sender: 'System',
        message: 'Welcome to the meeting room!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [token, meetingId, navigate, user, ROOM_ID]);

  // Join the room when component mounts
  useEffect(() => {
    const joinRoom = async () => {
      if (!user || !meetingInfo) {
        console.log('No user information or meeting info available, waiting...');
        return;
      }

      try {
        setIsJoining(true);

        console.log('Joining 100ms room with Room ID:', meetingInfo.room_id);
        console.log('User info:', user.full_name, user.role);

        // Use the 100ms service to join the meeting
        await joinMeeting(
          hmsActions,
          user.full_name || 'Anonymous',
          user.role || 'host'
        );

        console.log('Successfully joined the room');
        toast.success(`Successfully joined meeting: ${meetingInfo.title}`);

        // Set initial mute state
        setIsMuted(true);
      } catch (error) {
        console.error('Error joining room:', error);

        // More detailed error handling
        let errorMessage = 'Failed to join meeting';
        if (error instanceof Error) {
          errorMessage += ': ' + error.message;
          console.error('Error stack:', error.stack);
        } else {
          errorMessage += ': ' + String(error);
        }

        toast.error(errorMessage);
      } finally {
        setIsJoining(false);
      }
    };

    if (!isConnected && user && meetingInfo) {
      joinRoom();
    }
  }, [isConnected, user, meetingInfo, hmsActions]);

  // Cleanup function to leave the room when component unmounts
  useEffect(() => {
    return () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected, user]);

  // Function to leave the meeting room
  const leaveRoom = async () => {
    try {
      await leaveMeeting(hmsActions);
      toast.success('You have left the meeting');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Error leaving meeting');
    }
  };

  // Function to toggle audio
  const handleToggleAudio = async () => {
    try {
      await toggleAudio(hmsActions, !isLocalAudioEnabled);
      setIsMuted(isLocalAudioEnabled); // Update mute state (note the inverse logic)
      toast.success(isLocalAudioEnabled ? 'Microphone muted' : 'Microphone unmuted');
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Failed to toggle audio');
    }
  };

  // Function to toggle video
  const handleToggleVideo = async () => {
    try {
      await toggleVideo(hmsActions, !isLocalVideoEnabled);
      toast.success(isLocalVideoEnabled ? 'Camera turned off' : 'Camera turned on');
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle video');
    }
  };

  // Function to toggle screen sharing
  const handleToggleScreenShare = async () => {
    try {
      if (isSomeoneScreenSharing && !screenSharePeer) {
        // Someone else is sharing, can't share
        toast.error('Someone else is already sharing their screen');
        return;
      }

      const shouldEnable = !screenSharePeer;
      await toggleScreenShare(hmsActions, shouldEnable);
      toast.success(shouldEnable ? 'Screen sharing started' : 'Screen sharing stopped');
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  // Function to send a chat message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      // Use the 100ms SDK to send a broadcast message
      await hmsActions.sendBroadcastMessage(messageInput);

      // Add the message to our local state for immediate display
      const newMessage = {
        sender: user?.full_name || 'You',
        message: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, newMessage]);
      setMessageInput('');

      // Scroll to bottom of chat
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Listen for incoming chat messages using the HMS store
  const hmsMessages = useHMSStore(selectHMSMessages);

  // Update chat messages when hmsMessages changes
  useEffect(() => {
    if (!isConnected || !hmsMessages || hmsMessages.length === 0) return;

    // Get the latest message
    const latestMessage = hmsMessages[hmsMessages.length - 1];

    // Skip messages from the local peer (we already added those when sending)
    if (latestMessage.sender?.id === localPeer?.id) return;

    const newMessage = {
      sender: latestMessage.sender?.name || 'Unknown',
      message: latestMessage.message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
  }, [hmsMessages, isConnected, localPeer]);

  // Function to toggle hand raise
  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast.success(isHandRaised ? 'Hand lowered' : 'Hand raised');

    // In a real implementation, you would use the HMS SDK to broadcast this state
  };

  // Function to toggle recording
  const toggleRecording = async () => {
    if (recordingState === 'idle' || recordingState === 'error') {
      // Start recording
      setRecordingState('starting');
      try {
        // In a real implementation, you would use the HMS SDK to start recording
        // For now, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecordingState('recording');
        setIsRecording(true);
        toast.success('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
        setRecordingState('error');
        toast.error('Failed to start recording');
      }
    } else if (recordingState === 'recording') {
      // Stop recording
      setRecordingState('stopping');
      try {
        // In a real implementation, you would use the HMS SDK to stop recording
        // For now, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecordingState('idle');
        setIsRecording(false);
        toast.success('Recording stopped');
      } catch (error) {
        console.error('Error stopping recording:', error);
        setRecordingState('error');
        toast.error('Failed to stop recording');
      }
    }
  };

  // Define all functions before any useEffect hooks
  // Function to get available devices
  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      setAvailableDevices({
        audio: audioDevices,
        video: videoDevices
      });
    } catch (error) {
      console.error('Error getting available devices:', error);
      toast.error('Failed to get available devices');
    }
  };

  // Function to change audio device
  const changeAudioDevice = async (deviceId: string) => {
    try {
      // In a real implementation, you would use the HMS SDK to change the audio device
      // For now, we'll just update our state
      setSelectedDevice(prev => ({ ...prev, audio: deviceId }));
      toast.success('Audio device changed');
    } catch (error) {
      console.error('Error changing audio device:', error);
      toast.error('Failed to change audio device');
    }
  };

  // Function to change video device
  const changeVideoDevice = async (deviceId: string) => {
    try {
      // In a real implementation, you would use the HMS SDK to change the video device
      // For now, we'll just update our state
      setSelectedDevice(prev => ({ ...prev, video: deviceId }));
      toast.success('Video device changed');
    } catch (error) {
      console.error('Error changing video device:', error);
      toast.error('Failed to change video device');
    }
  };

  // Show loading state when joining or no meeting info is available
  if (isJoining || !meetingInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-pulse text-2xl font-semibold mb-4">Joining meeting...</div>
        <p className="text-gray-500">{meetingInfo?.title || 'Loading meeting information'}</p>
        <p className="text-sm text-gray-400 mt-2">Room ID: {meetingInfo?.room_id || ROOM_ID}</p>
        <div className="mt-4 text-sm text-gray-400">
          {isJoining ? 'Connecting to 100ms...' : 'Preparing meeting room...'}
        </div>
      </div>
    );
  }

  // Define all event handlers before any useEffect hooks
  // Handle key press for chat
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold">{meetingInfo.title}</h1>
          <div className="flex items-center text-sm text-gray-400">
            <span>{meetingInfo.duration}</span>
            {isRecording && (
              <div className="flex items-center ml-3 text-red-500">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                <span>Recording</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className={showParticipants ? 'bg-gray-700' : ''}
          >
            <Users className="h-4 w-4 mr-1" />
            {peers.length}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'bg-gray-700' : ''}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={showSettings ? 'bg-gray-700' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </Button>
          <Button variant="destructive" size="sm" onClick={leaveRoom}>
            <PhoneOff className="h-4 w-4 mr-1" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isConnected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {/* Screen share takes priority if active */}
              {isSomeoneScreenSharing && screenSharePeer && (
                <div className="col-span-full row-span-2 mb-4">
                  <VideoTile peer={screenSharePeer} isLocal={screenSharePeer.id === localPeer?.id} />
                </div>
              )}

              {/* Local peer video */}
              {localPeer && (
                <VideoTile peer={localPeer} isLocal={true} />
              )}

              {/* Remote peers videos */}
              {peers
                .filter(peer => peer.id !== localPeer?.id)
                // Don't show screen share peer twice if they're already shown above
                .filter(peer => !(isSomeoneScreenSharing && screenSharePeer && peer.id === screenSharePeer.id))
                .map(peer => (
                  <VideoTile key={peer.id} peer={peer} />
                ))
              }
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <p>Connecting to meeting...</p>
            </div>
          )}
        </div>

        {/* Sidebar for participants, chat, or settings */}
        {(showParticipants || showChat || showSettings) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            {/* Participants panel */}
            {showParticipants && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Participants ({peers.length})</h2>
                <ul className="space-y-2">
                  {peers.map(peer => (
                    <li key={peer.id} className="flex items-center justify-between text-white py-2 px-3 rounded hover:bg-gray-700">
                      <div className="flex items-center">
                        {peer.isHandRaised && (
                          <span className="mr-2 text-yellow-400" title="Hand raised">✋</span>
                        )}
                        <span>{peer.name} {peer.id === localPeer?.id && '(You)'}</span>
                      </div>
                      <div className="flex space-x-1">
                        {peer.isScreenSharing && <ScreenShare className="h-4 w-4 text-blue-400" />}
                        {!peer.isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                        {!peer.isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chat panel */}
            {showChat && (
              <div className="h-full flex flex-col">
                <h2 className="text-lg font-semibold text-white mb-4">Chat</h2>
                <div className="flex-1 flex flex-col">
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto mb-4 bg-gray-900 rounded p-3 space-y-3"
                  >
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-400 text-center">No messages yet</p>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div key={index} className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-400">{msg.sender}</span>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                          </div>
                          <p className="text-white mt-1">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 text-white rounded-l px-3 py-2 focus:outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings panel */}
            {showSettings && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>

                {/* Audio devices */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-white mb-2">Audio Input</h3>
                  <select
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                    value={selectedDevice.audio || ''}
                    onChange={(e) => changeAudioDevice(e.target.value)}
                  >
                    <option value="">Select microphone</option>
                    {availableDevices.audio.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video devices */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-white mb-2">Video Input</h3>
                  <select
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                    value={selectedDevice.video || ''}
                    onChange={(e) => changeVideoDevice(e.target.value)}
                  >
                    <option value="">Select camera</option>
                    {availableDevices.video.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recording controls */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-white mb-2">Recording</h3>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={toggleRecording}
                    disabled={recordingState === 'starting' || recordingState === 'stopping'}
                    className="w-full"
                  >
                    {recordingState === 'starting' && 'Starting recording...'}
                    {recordingState === 'recording' && 'Stop Recording'}
                    {recordingState === 'stopping' && 'Stopping recording...'}
                    {(recordingState === 'idle' || recordingState === 'error') && 'Start Recording'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 text-white p-4 flex justify-center items-center space-x-4 border-t border-gray-700">
        {/* Audio control */}
        <Button
          variant={isLocalAudioEnabled ? "outline" : "destructive"}
          onClick={handleToggleAudio}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          title={isLocalAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isLocalAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        {/* Video control */}
        <Button
          variant={isLocalVideoEnabled ? "outline" : "destructive"}
          onClick={handleToggleVideo}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          title={isLocalVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isLocalVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        {/* Screen share control */}
        <Button
          variant={screenSharePeer ? "destructive" : "outline"}
          onClick={handleToggleScreenShare}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          title={screenSharePeer ? 'Stop sharing' : 'Share screen'}
        >
          <ScreenShare className="h-5 w-5" />
        </Button>

        {/* Hand raise control */}
        <Button
          variant={isHandRaised ? "default" : "outline"}
          onClick={toggleHandRaise}
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <span className="text-lg">✋</span>
        </Button>

        {/* Leave meeting */}
        <Button
          variant="destructive"
          onClick={leaveRoom}
          className="px-4"
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  );
};

// Wrapper component with HMSRoomProvider
const MeetingRoom = () => {
  const [sdkError, setSdkError] = useState<string | null>(null);

  // Handle errors from the 100ms SDK
  const handleError = (error: any) => {
    console.error('100ms SDK Error:', error);
    setSdkError(error?.message || 'Failed to initialize video conferencing');
  };

  // If there's an SDK error, show a fallback UI
  if (sdkError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Video Conferencing Error</h2>
          <p className="text-gray-700 mb-6">{sdkError}</p>
          <p className="text-gray-600 mb-6">This could be due to network issues, browser permissions, or a problem with the video conferencing service.</p>
          <div className="space-y-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HMSRoomProvider onError={handleError}>
      <MeetingRoomContent />
    </HMSRoomProvider>
  );
};

export default MeetingRoom;
