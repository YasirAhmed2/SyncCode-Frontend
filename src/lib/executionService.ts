// import api from "./api";
import axios from "axios";
/* =======================
   CODE EXECUTION SERVICE
======================= */

export const executionService = {
  execute: async (data: {
    code: string;
    language: "javascript" | "python";
    input?: string;
  }) => {
    const res = await axios.post("https://synccode-backend-production.up.railway.app/execute", data, { withCredentials: true });
    return res.data;
  },
};
