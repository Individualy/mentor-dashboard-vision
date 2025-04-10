import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getMeetings, Meeting } from '@/lib/100msService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Video, Calendar, Clock, User, Plus } from 'lucide-react';

const MeetingsList = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useUser();

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const fetchedMeetings = await getMeetings(token);
        setMeetings(fetchedMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast.error('Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [token]);

  const handleJoinMeeting = (meetingId: string) => {
    navigate(`/meeting-room?id=${meetingId}`);
  };

  const handleCreateMeeting = () => {
    navigate('/create-meeting');
  };

  // Function to determine if a meeting is active (current time is between start and end)
  const isMeetingActive = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);
    return now >= startTime && now <= endTime;
  };

  // Function to determine if a meeting is upcoming (current time is before start)
  const isMeetingUpcoming = (meeting: Meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    return now < startTime;
  };

  // Function to format the meeting time
  const formatMeetingTime = (meeting: Meeting) => {
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);
    
    return `${format(startTime, 'MMM d, yyyy')} · ${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Meetings</h2>
        <Button onClick={handleCreateMeeting}>
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <Video className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-medium">No meetings found</h3>
                <p className="text-gray-500 mt-1">Create a new meeting to get started</p>
              </div>
              <Button onClick={handleCreateMeeting}>Create Meeting</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className={isMeetingActive(meeting) ? 'border-green-500' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{meeting.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {meeting.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  {isMeetingActive(meeting) && (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                      Active
                    </div>
                  )}
                  {isMeetingUpcoming(meeting) && (
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Upcoming
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatMeetingTime(meeting)}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    Created by: {meeting.created_by}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleJoinMeeting(meeting.id)} 
                  className="w-full"
                  variant={isMeetingActive(meeting) ? "default" : "outline"}
                  disabled={!isMeetingActive(meeting) && !isMeetingUpcoming(meeting)}
                >
                  {isMeetingActive(meeting) ? 'Join Now' : isMeetingUpcoming(meeting) ? 'Join When Active' : 'Meeting Ended'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsList;
