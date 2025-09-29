// lib/asaas/customers.ts
import { asaas } from "../asaas/client"

export async function ensureAsaasCustomer(params: { name: string; email: string; cpfCnpj?: string; phone?: string }) {
  const res = await asaas.post("/customers", params)
  return res.data // retorna { id, ... }
}
