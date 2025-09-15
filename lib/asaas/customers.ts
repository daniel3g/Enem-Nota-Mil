// lib/asaas/customers.ts
import { asaas } from "./client";

export async function createCustomer(user: {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}) {
  const response = await asaas.post("/customers", user);
  return response.data;
}
