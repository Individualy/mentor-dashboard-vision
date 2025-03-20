import React from 'react';
import { Pencil } from "lucide-react";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  link: string;
  duration: string;
  class_id: number;
}

interface MeetingContextMenuProps {
  meeting: Meeting;
  onTitleChange: (meetingId: string, newTitle: string) => void;
  children: React.ReactNode;
}

export const MeetingContextMenu: React.FC<MeetingContextMenuProps> = ({
  meeting,
  onTitleChange,
  children
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(meeting.title);

  const handleSaveTitle = () => {
    if (newTitle.trim() === "") return;
    
    onTitleChange(meeting.id, newTitle);
    setIsEditing(false);
    toast.success("Meeting title updated successfully");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setNewTitle(meeting.title);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {!isEditing ? (
          <ContextMenuItem
            onClick={() => setIsEditing(true)}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Title
          </ContextMenuItem>
        ) : (
          <div className="p-2 flex flex-col gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Enter new title"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setNewTitle(meeting.title);
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSaveTitle}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};