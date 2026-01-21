import axios from "axios";
// import api from "./api";

/* =======================
   ROOM SERVICE
======================= */

export const roomService = {
  // Create coding room
  createRoom: async (language: "javascript" | "python") => {
    const res = await axios.post("https://synccode-backend-production.up.railway.app/rooms/create", 
      { language },
      { withCredentials: true });
    return res.data;
  },

  // Join room
  joinRoom: async (roomId: string) => {
    const res = await axios.post(`https://synccode-backend-production.up.railway.app/rooms/join/${roomId}`, {}, { withCredentials: true });
    return res.data;
  },

  // Fetch room participants
  getParticipants: async (roomId: string) => {
    const res = await axios.get(`https://synccode-backend-production.up.railway.app/rooms/${roomId}/participants`, { withCredentials: true });
    return res.data;
  },

  // Save code
  saveCode: async (data: {
    roomId: string;
    code: string;
    language: string;
  }) => {
    const res = await axios.put(`https://synccode-backend-production.up.railway.app/rooms/${data.roomId}/code/save`, {
      code: data.code,
      language: data.language,
    }, { withCredentials: true });
    return res.data;
  },

  // Load code
  loadCode: async (roomId: string) => {
    const res = await axios.get(`https://synccode-backend-production.up.railway.app/rooms/${roomId}/code`, { withCredentials: true });
    return res.data;
  },

  // Get my rooms
  getMyRooms: async () => {
    const res = await axios.get('https://synccode-backend-production.up.railway.app/rooms/my-rooms', { withCredentials: true });
    return res.data;
  },
};
