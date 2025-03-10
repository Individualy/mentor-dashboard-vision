import React, { useState } from 'react';
import { Video, Users, Plus } from 'lucide-react';
import { toast } from "sonner";
import { MeetingContextMenu } from '@/components/ui/meeting-context-menu';
import axios from 'axios'; // Import axios

interface Student {
  id: string;
  name: string;
  imageUrl: string;
  isVideoOn: boolean;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  link: string;
}

// Define the type for the response data
interface CreateMeetingResponse {
  meet_link: string;
}

const handleCopyLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard");
  } catch (err) {
    toast.error("Failed to copy link");
  }
};

const TeacherDashboard: React.FC = () => {
  const [meetings, setMeetings] = useState([
    {
      id: '1',
      title: 'Mathematics Class',
      date: '2024-03-20',
      time: '10:00 AM',
      link: 'https://meet.google.com/abc-defg-hij',
    }
  ]);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);

  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      isVideoOn: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      isVideoOn: false,
    },
  ]);

  const createNewMeeting = async () => {
    setIsCreatingMeeting(true);
    try {
      const response = await axios.post<CreateMeetingResponse>('http://localhost:5000/create-meeting');
      const meetLink = response.data.meet_link;

      const newMeeting = {
        id: String(meetings.length + 1),
        title: `Class ${meetings.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        link: meetLink,
      };
      setMeetings([...meetings, newMeeting]);
      toast.success("Meeting created successfully");
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleTitleChange = (meetingId: string, newTitle: string) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === meetingId ? { ...meeting, title: newTitle } : meeting
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Meeting Management */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Meetings</h2>
              <button
                onClick={createNewMeeting}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={isCreatingMeeting}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Meeting
              </button>
            </div>
            
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <MeetingContextMenu 
                  key={meeting.id} 
                  meeting={meeting} 
                  onTitleChange={handleTitleChange}
                >
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-context-menu">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                        <p className="text-sm text-gray-500">
                          {meeting.date} at {meeting.time}
                        </p>
                      </div>
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={handleCopyLink.bind(null, meeting.link)}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </MeetingContextMenu>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Student Monitoring */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Connected Students
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={student.imageUrl}
                        alt={student.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      {student.isVideoOn ? (
                        <Video className="h-4 w-4 absolute bottom-0 right-0 text-green-500" />
                      ) : (
                        <Video className="h-4 w-4 absolute bottom-0 right-0 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">
                        {student.isVideoOn ? 'Camera On' : 'Camera Off'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;