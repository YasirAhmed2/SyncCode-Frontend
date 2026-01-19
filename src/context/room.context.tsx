/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { roomService } from '../lib/roomService';

interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

interface Room {
  id: string;
  name: string;
  createdBy: string;
  participants: Participant[];
  createdAt: Date;
}

interface RoomContextType {
  currentRoom: Room | null;
  rooms: Room[];
  messages: Message[];
  code: string;
  language: 'javascript' | 'python';
  createRoom: (language: "javascript" | "python") => Promise<Room>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  sendMessage: (content: string) => void;
  updateCode: (newCode: string) => void;
  setLanguage: (lang: 'javascript' | 'python') => void;
  executeCode: () => Promise<{ output: string; error: string | null }>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

// Mock participants removed


export function RoomProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState<string>('// Start coding here...\nconsole.log("Hello, SyncCode!");');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  const createRoom = async (language: "javascript" | "python"): Promise<Room> => {
    // Note: Dashboard usually calls roomService.createRoom directly then navigates.
    // But if called via context, we should forward to service. 
    // However, the Room interface here in context (id, name, createdBy, participants) might differ slightly from backend response structure.
    // Let's adapt.
    const data = await roomService.createRoom(language);
    const newRoom: Room = {
      id: data.room.roomId,
      name: data.room.name || 'Untitled Room',
      createdBy: data.room.createdBy,
      participants: (data.room.participants || []).map((p: any) => ({
        id: p._id || p,
        name: p.name || 'User',
        avatarColor: '#00D9FF',
        isOnline: true
      })),
      createdAt: new Date(),
    };

    // Update local state
    setRooms(prev => [newRoom, ...prev]);
    setCurrentRoom(newRoom);
    setMessages([]);
    setCode(data.room.code || (language === 'python' ? "print('Hello, World!')" : "console.log('Hello, World!');"));
    setLanguage(language);

    return newRoom;
  };

  const joinRoom = async (roomId: string) => {
    try {
      const data = await roomService.joinRoom(roomId);
      console.log('Join Room Data:', data); // Log to debug

      const joinedRoom: Room = {
        id: data.room.roomId,
        name: data.room.name || 'Joined Room',
        createdBy: data.room.createdBy,
        participants: (data.room.participants || []).map((p: any) => ({
          id: p._id || p.id || p,
          name: p.name || 'Mates',
          avatarColor: '#00E5A0',
          isOnline: true
        })),
        createdAt: new Date(),
      };

      setCurrentRoom(joinedRoom);

      // IMPORTANT: Update code and language from backend response
      if (data.room.code !== undefined) {
        setCode(data.room.code);
      }
      if (data.room.language) {
        setLanguage(data.room.language as 'javascript' | 'python');
      }

    } catch (error) {
      console.error("Failed to join room in context", error);
      // Fallback or error handling?
      // For now, let's not break the UI if it fails, but maybe toast?
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setMessages([]);
    setCode('// Code cleared');
  };

  const sendMessage = (content: string) => {
    // Placeholder for socket
    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      userId: 'current_user',
      userName: 'You',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateCode = (newCode: string) => {
    setCode(newCode);
  };

  const executeCode = async (): Promise<{ output: string; error: string | null }> => {
    // Use axios or execution service here if we want to centralize.
    // But since rooms.tsx handles it separately, we can leave a stub or implement active call.
    // Let's implement active call for completeness.
    try {
      // Need axios or execution service
      // We can just rely on the UI component to handle execution for now since it has complex state (loading etc).
      // Or return a placeholder warning.
      return { output: 'Execution handled by component', error: null };
    } catch (err) {
      return { output: '', error: 'Execution error' };
    }
  };

  return (
    <RoomContext.Provider
      value={{
        currentRoom,
        rooms,
        messages,
        code,
        language,
        createRoom,
        joinRoom,
        leaveRoom,
        sendMessage,
        updateCode,
        setLanguage,
        executeCode,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
