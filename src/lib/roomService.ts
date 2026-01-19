import api from "./api";

/* =======================
   ROOM SERVICE
======================= */

export const roomService = {
  // Create coding room
  createRoom: async (language: "javascript" | "python") => {
    const res = await api.post("/rooms/create", { language });
    return res.data;
  },

  // Join room
  joinRoom: async (roomId: string) => {
    const res = await api.post(`/rooms/join/${roomId}`);
    return res.data;
  },

  // Fetch room participants
  getParticipants: async (roomId: string) => {
    const res = await api.get(`/rooms/${roomId}/participants`);
    return res.data;
  },

  // Save code
  saveCode: async (data: {
    roomId: string;
    code: string;
    language: string;
  }) => {
    const res = await api.put(`/rooms/${data.roomId}/code/save`, {
      code: data.code,
      language: data.language,
    });
    return res.data;
  },

  // Load code
  loadCode: async (roomId: string) => {
    const res = await api.get(`/rooms/${roomId}/code`);
    return res.data;
  },

  // Get my rooms
  getMyRooms: async () => {
    const res = await api.get('/rooms/my-rooms');
    return res.data;
  },
};
