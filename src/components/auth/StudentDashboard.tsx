
import React, { useEffect, useState } from 'react';
import { Calendar, Video, Users, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '@/contexts/UserContext';
import { Meeting } from '@/lib/api';
import { getMeetings } from '@/lib/100msService';
import { format, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import { toast } from 'sonner';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useUser();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!token) return;

      try {
        setLoading(true);
        // Use the 100ms service to fetch meetings
        const meetingsData = await getMeetings(token);
        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast.error('Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [token]);

  const joinMeeting = (meetingId: string) => {
    console.log('Joining 100ms meeting room:', meetingId);
    navigate(`/meeting-room?id=${meetingId}`);
  };

  // Helper function to determine if a meeting is active (happening now)
  const isMeetingActive = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = parseISO(startTime);
    const end = parseISO(endTime);

    return isAfter(now, start) && isBefore(now, end);
  };

  // Helper function to determine if a meeting is upcoming (within the next 24 hours)
  const isMeetingUpcoming = (startTime: string) => {
    const now = new Date();
    const start = parseISO(startTime);
    const tomorrow = addMinutes(now, 24 * 60); // 24 hours from now

    return isAfter(start, now) && isBefore(start, tomorrow);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Available Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading meetings...</span>
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p>No meetings available</p>
                </div>
              ) : (
                meetings.map(meeting => {
                  const isActive = isMeetingActive(meeting.start_time, meeting.end_time);
                  const isUpcoming = isMeetingUpcoming(meeting.start_time);

                  return (
                    <div
                      key={meeting.id}
                      className={`border rounded-lg p-4 ${isActive ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Video className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{format(parseISO(meeting.start_time), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{meeting.duration}</span>
                            </div>
                          </div>
                        </div>
                        {isActive ? (
                          <Button onClick={() => joinMeeting(meeting.id)}>
                            Join Now
                          </Button>
                        ) : isUpcoming ? (
                          <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md">
                            Upcoming
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-full p-3">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">{user?.full_name || 'Loading...'}</h3>
                  <p className="text-sm text-gray-500">{user?.role || 'Loading...'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Quick Links</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>View your assignments</li>
                  <li>Check your grades</li>
                  <li>Access learning resources</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
