import api from "./api";

/* =======================
   CODE EXECUTION SERVICE
======================= */

export const executionService = {
  execute: async (data: {
    code: string;
    language: "javascript" | "python";
    input?: string;
  }) => {
    const res = await api.post("/execute", data);
    return res.data;
  },
};
