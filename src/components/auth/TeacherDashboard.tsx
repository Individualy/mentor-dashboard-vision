import React, { useEffect, useState } from 'react';
import { Video, Users, Plus, Calendar } from 'lucide-react';
import { toast } from "sonner";
import { MeetingContextMenu } from '@/components/ui/meeting-context-menu';
import axios from 'axios';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  name: string;
  imageUrl: string;
  isVideoOn: boolean;
}

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  link: string;
  duration: string;
  class_id: number;
}

// Define the type for the response data
interface CreateMeetingResponse {
  meet_link: string;
  html_link?: string;
  event_id?: string;
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
  
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeetingData, setNewMeetingData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  });

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

  const fetchMeetings = async () => {
    try {
      const response = await fetch("http://localhost:5000/get-meetings");
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to fetch meetings");
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Set up polling every second
    const interval = setInterval(fetchMeetings, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setNewMeetingData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMeetingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createNewMeeting = async () => {
    if (!newMeetingData.title || !newMeetingData.startTime || !newMeetingData.endTime) {
      toast.error("Please fill all fields");
      return;
    }

    setIsCreatingMeeting(true);
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const startTime = `${today} ${newMeetingData.startTime}:00`;
      const endTime = `${today} ${newMeetingData.endTime}:00`;

      const response = await axios.post<CreateMeetingResponse>('http://localhost:5000/create-meeting', {
        title: newMeetingData.title,
        start_time: startTime,
        end_time: endTime,
        class_id: 1
      });

      if (response.data.meet_link) {
        toast.success("Meeting created successfully");
        resetForm();
        setIsDialogOpen(false);
        fetchMeetings(); // Refresh meetings list
      } else {
        throw new Error('Failed to create meeting');
      }
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      toast.error(error.response?.data?.error || "Failed to create meeting");
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="flex items-center px-4 py-2"
                    disabled={isCreatingMeeting}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Meeting</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={newMeetingData.title}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="Meeting Title"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startTime" className="text-right">
                        Start Time
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          value={newMeetingData.startTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endTime" className="text-right">
                        End Time
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          value={newMeetingData.endTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={createNewMeeting}
                      disabled={isCreatingMeeting}
                    >
                      {isCreatingMeeting ? "Creating..." : "Create Meeting"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <MeetingContextMenu 
                  key={meeting.id} 
                  meeting={meeting} 
                  onTitleChange={handleTitleChange}
                >
                  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-context-menu mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(meeting.start_time).toLocaleDateString()} at {new Date(meeting.start_time).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Duration: {meeting.duration}
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