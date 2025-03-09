import React from 'react';
import { Calendar, Video } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const meetings = [
    {
      id: '1',
      title: 'Mathematics Class',
      teacher: 'Prof. Johnson',
      date: '2024-03-20',
      time: '10:00 AM',
      link: 'https://meet.google.com/abc-defg-hij',
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Physics Class',
      teacher: 'Dr. Smith',
      date: '2024-03-20',
      time: '2:00 PM',
      link: 'https://meet.google.com/xyz-uvw-rst',
      status: 'completed',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Meetings</h2>
        
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`border rounded-lg p-4 ${
                meeting.status === 'upcoming'
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Video className={`h-6 w-6 ${
                      meeting.status === 'upcoming' ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-500">{meeting.teacher}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{meeting.date} at {meeting.time}</span>
                    </div>
                  </div>
                </div>
                
                {meeting.status === 'upcoming' && (
                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Join Meeting
                  </a>
                )}
                
                {meeting.status === 'completed' && (
                  <span className="text-gray-500 text-sm">Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;