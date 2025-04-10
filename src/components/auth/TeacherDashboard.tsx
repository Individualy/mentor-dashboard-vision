import React from 'react';
import { VideoIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '@/contexts/UserContext';
import MeetingsList from '@/components/meeting/MeetingsList';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const create100msMeeting = () => {
    navigate('/create-meeting');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Video Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-gray-600">
                Create a new video meeting using 100ms. You can invite students to join your meeting.
              </p>
              <Button
                className="flex items-center w-full justify-center"
                onClick={create100msMeeting}
              >
                <VideoIcon className="h-5 w-5 mr-2" />
                Create New Meeting
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
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
                  <li>View your schedule</li>
                  <li>Manage student assignments</li>
                  <li>Access teaching resources</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <MeetingsList />
    </div>
  );
};

export default TeacherDashboard;
