import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { createMeeting } from '@/lib/100msService';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Time slots for meeting duration
const TIME_SLOTS = [
  '30 minutes',
  '1 hour',
  '1.5 hours',
  '2 hours',
  '3 hours'
];

const CreateMeeting = () => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date());
  const [meetingTime, setMeetingTime] = useState('09:00');
  const [meetingDuration, setMeetingDuration] = useState('1 hour');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useUser();

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }

    if (!meetingDate) {
      toast.error('Please select a meeting date');
      return;
    }

    if (!user || !token) {
      toast.error('You must be logged in to create a meeting');
      return;
    }

    setIsCreating(true);

    try {
      // Calculate start and end times
      const [hours, minutes] = meetingTime.split(':').map(Number);
      const startDate = new Date(meetingDate);
      startDate.setHours(hours, minutes, 0, 0);

      // Calculate end time based on duration
      const endDate = new Date(startDate);
      const durationMatch = meetingDuration.match(/(\d+(?:\.\d+)?)\s*(hour|hours|minute|minutes)/i);

      if (durationMatch) {
        const value = parseFloat(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();

        if (unit.startsWith('hour')) {
          endDate.setTime(endDate.getTime() + value * 60 * 60 * 1000);
        } else if (unit.startsWith('minute')) {
          endDate.setTime(endDate.getTime() + value * 60 * 1000);
        }
      } else {
        // Default to 1 hour if parsing fails
        endDate.setTime(endDate.getTime() + 60 * 60 * 1000);
      }

      console.log('Creating meeting with title:', meetingTitle);
      console.log('Start time:', startDate.toISOString());
      console.log('End time:', endDate.toISOString());

      // Create the meeting
      const meeting = await createMeeting(
        token,
        meetingTitle,
        meetingDescription,
        startDate.toISOString(),
        endDate.toISOString()
      );

      toast.success(`Meeting "${meetingTitle}" created successfully!`);

      // Navigate to the meeting room with the meeting ID
      navigate(`/meeting-room?id=${meeting.id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a New Meeting</CardTitle>
        <CardDescription>
          Set up a new video meeting with your students or colleagues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Meeting Title</Label>
            <Input
              id="meeting-title"
              placeholder="Enter meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Host</Label>
            <div className="p-2 border rounded-md bg-gray-50">
              {user ? `${user.full_name} (${user.role})` : 'Loading user information...'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCreateMeeting}
          disabled={isCreating || !user}
        >
          {isCreating ? 'Creating Meeting...' : 'Create Meeting'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateMeeting;
