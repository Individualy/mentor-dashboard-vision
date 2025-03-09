
import React, { useState } from 'react';
import { UsersRound, Settings, UserCog, Shield, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Teacher' | 'Student';
  status: 'Active' | 'Inactive';
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Teacher', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Student', status: 'Active' },
    { id: '3', name: 'Robert Brown', email: 'robert@example.com', role: 'Teacher', status: 'Inactive' },
    { id: '4', name: 'Emily Johnson', email: 'emily@example.com', role: 'Student', status: 'Active' },
  ]);

  const [statistics] = useState({
    totalUsers: 42,
    activeTeachers: 8,
    activeStudents: 34,
    meetingsToday: 12
  });

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } 
        : user
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <UsersRound className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
                <CardDescription>System users count</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statistics.totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Teachers</CardTitle>
                <CardDescription>Teaching staff</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statistics.activeTeachers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Students</CardTitle>
                <CardDescription>Enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statistics.activeStudents}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today's Meetings</CardTitle>
                <CardDescription>Scheduled sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{statistics.meetingsToday}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Server Uptime</span>
                  <span className="text-green-500">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Database Connections</span>
                  <span className="text-green-500">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>API Response Time</span>
                  <span className="text-green-500">120ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <Button className="flex items-center space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'Teacher' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleUserStatus(user.id)}
                            className={user.status === 'Active' ? 'text-red-600' : 'text-green-600'}
                          >
                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage system-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Email Settings</h3>
                <p className="text-sm text-gray-500">SMTP configured and operational</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Session Duration</h3>
                <p className="text-sm text-gray-500">Sessions expire after 24 hours</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Backup Configuration</h3>
                <p className="text-sm text-gray-500">Daily backups at 02:00 UTC</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Configuration</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>[2023-04-01 14:32:15] User login - admin@example.com</span>
                <span className="text-gray-500">INFO</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>[2023-04-01 13:45:22] Database maintenance completed</span>
                <span className="text-gray-500">INFO</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>[2023-04-01 12:18:07] Failed login attempt - unknown@example.com</span>
                <span className="text-yellow-500">WARNING</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>[2023-04-01 10:05:33] System backup completed</span>
                <span className="text-gray-500">INFO</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">View All Logs</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
