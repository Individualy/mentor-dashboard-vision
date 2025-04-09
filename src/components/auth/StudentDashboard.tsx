
import React, { useEffect, useState } from 'react';
import { Calendar, Video, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import VideoConference from '@/components/video/VideoConference';
import { Button } from '@/components/ui/button';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  link: string;
  duration: string;
  class_id: number;
  teacher?: string;
  status?: 'upcoming' | 'active' | 'completed';
}

const StudentDashboard: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMeeting, setNotificationMeeting] = useState<Meeting | null>(null);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("http://localhost:5000/get-meetings");
      const data = await response.json();
      
      // Process meetings to add status
      const now = new Date();
      const processedMeetings = data.map((meeting: Meeting) => {
        const startTime = new Date(meeting.start_time);
        const endTime = new Date(meeting.end_time);
        let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
        
        if (now > endTime) {
          status = 'completed';
        } else if (now >= startTime && now <= endTime) {
          status = 'active';
          
          // Show notification for active meetings
          if (!notificationMeeting || notificationMeeting.id !== meeting.id) {
            setNotificationMeeting(meeting);
            setShowNotification(true);
          }
        }
        
        return {
          ...meeting,
          status,
          teacher: 'Prof. Johnson' // Placeholder, should come from backend
        };
      });
      
      setMeetings(processedMeetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Set up polling every few seconds
    const interval = setInterval(fetchMeetings, 10000);
    return () => clearInterval(interval);
  }, []);

  // Show toast notification for active meetings
  useEffect(() => {
    if (showNotification && notificationMeeting) {
      toast(
        <div className="flex flex-col">
          <div className="font-semibold">Class Starting Now</div>
          <div>{notificationMeeting.title}</div>
          <Button 
            className="mt-2" 
            size="sm"
            onClick={() => {
              setActiveMeeting(notificationMeeting);
              setShowNotification(false);
            }}
          >
            Join Now
          </Button>
        </div>,
        {
          duration: 10000,
          icon: <BellRing className="h-5 w-5 text-blue-500" />
        }
      );
      setShowNotification(false);
    }
  }, [showNotification, notificationMeeting]);

  const joinMeeting = (meeting: Meeting) => {
    setActiveMeeting(meeting);
  };

  const leaveMeeting = () => {
    setActiveMeeting(null);
  };

  if (activeMeeting) {
    return (
      <VideoConference 
        meeting={activeMeeting} 
        onLeaveMeeting={leaveMeeting} 
        role="participant"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Meetings</h2>
        
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`border rounded-lg p-4 ${
                meeting.status === 'active'
                  ? 'border-green-200 bg-green-50'
                  : meeting.status === 'upcoming'
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Video className={`h-6 w-6 ${
                      meeting.status === 'active' ? 'text-green-600' :
                      meeting.status === 'upcoming' ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-500">{meeting.teacher}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(meeting.start_time).toLocaleDateString()} at {new Date(meeting.start_time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                {meeting.status === 'active' && (
                  <Button
                    onClick={() => joinMeeting(meeting)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Join Now
                  </Button>
                )}
                
                {meeting.status === 'upcoming' && (
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md">
                    Upcoming
                  </span>
                )}
                
                {meeting.status === 'completed' && (
                  <span className="text-gray-500 text-sm">Completed</span>
                )}
              </div>
            </div>
          ))}

          {meetings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No meetings scheduled. Check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
