// lib/asaas/client.ts
import axios from "axios";

export const asaas = axios.create({
  baseURL: process.env.ASAAS_BASE_URL,
  headers: {
    access_token: process.env.ASAAS_API_KEY!,
    "Content-Type": "application/json",
  },
});
