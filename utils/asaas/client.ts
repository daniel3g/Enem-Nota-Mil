import axios from "axios";

const baseURL = process.env.ASAAS_BASE_URL;
const token = process.env.ASAAS_API_KEY;

if (!baseURL) {
  throw new Error("⚠️ ASAAS_BASE_URL não definida no .env.local");
}
if (!token) {
  throw new Error("⚠️ ASAAS_API_KEY não definida no .env.local");
}

export const asaas = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    access_token: token,
  },
});
