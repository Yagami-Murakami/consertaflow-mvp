import { supabase } from "@/integrations/supabase/client";
import { onlyDigits } from "@/lib/consertaflow";
import type { Tables } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;
export type Client = Tables<"clients">;
export type Order = Tables<"service_orders">;
export type Reminder = Tables<"reminders">;

export function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/**
 * Converte um lead em cliente + ordem de serviço.
 * Reaproveita cliente existente com o mesmo WhatsApp (comparando só dígitos).
 */
export async function convertLead(lead: Lead) {
  if (lead.convertido) throw new Error("Este lead já foi convertido.");
  const digits = onlyDigits(lead.whatsapp);

  const { data: clients, error: e1 } = await supabase.from("clients").select("id, whatsapp");
  fail(e1);
  let clientId = clients?.find((c) => onlyDigits(c.whatsapp) === digits)?.id;

  if (!clientId) {
    const { data, error } = await supabase
      .from("clients")
      .insert({ nome: lead.nome, whatsapp: lead.whatsapp, email: lead.email })
      .select("id")
      .single();
    fail(error);
    clientId = data!.id;
  }

  const { data: order, error: e2 } = await supabase
    .from("service_orders")
    .insert({
      client_id: clientId,
      equipamento_tipo: lead.equipamento_tipo,
      marca_modelo: lead.marca_modelo,
      problema_relatado: lead.problema,
      observacoes: lead.urgencia === "urgente" ? "Cliente marcou como urgente." : null,
    })
    .select("id")
    .single();
  fail(e2);

  const { error: e3 } = await supabase
    .from("leads")
    .update({ convertido: true, status: "convertido", client_id: clientId, order_id: order!.id })
    .eq("id", lead.id);
  fail(e3);
  return order!.id;
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}