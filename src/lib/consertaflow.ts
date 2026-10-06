/**
 * Configurações centrais do ConsertaFlow.
 * Altere o número de WhatsApp da assistência aqui (apenas dígitos, com DDI+DDD).
 */
export const WHATSAPP_ASSISTENCIA = "5511999999999";

export const NOME_APP = "ConsertaFlow";

export const TIPOS_EQUIPAMENTO = [
  "Notebook",
  "Computador/Desktop",
  "Impressora",
  "Videogame/Console",
  "Smartphone",
  "Outro",
] as const;

export const URGENCIAS = [
  { value: "normal", label: "Normal" },
  { value: "urgente", label: "Urgente" },
] as const;

export const PERIODOS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
] as const;

export type OrderStatus =
  | "novo"
  | "em_diagnostico"
  | "aguardando_aprovacao"
  | "aprovado"
  | "em_reparo"
  | "pronto_retirada"
  | "entregue"
  | "cancelado";

export const ORDER_STATUS: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "novo", label: "Novo", tone: "info" },
  { value: "em_diagnostico", label: "Em diagnóstico", tone: "info" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação", tone: "warn" },
  { value: "aprovado", label: "Aprovado", tone: "info" },
  { value: "em_reparo", label: "Em reparo", tone: "warn" },
  { value: "pronto_retirada", label: "Pronto para retirada", tone: "ok" },
  { value: "entregue", label: "Entregue", tone: "ok" },
  { value: "cancelado", label: "Cancelado", tone: "danger" },
];

export const LEAD_STATUS = [
  { value: "novo", label: "Novo", tone: "info" },
  { value: "em_contato", label: "Em contato", tone: "warn" },
  { value: "convertido", label: "Convertido", tone: "ok" },
  { value: "descartado", label: "Descartado", tone: "danger" },
];

export function statusLabel(value: string | null | undefined) {
  if (!value) return "—";
  return (
    ORDER_STATUS.find((s) => s.value === value)?.label ??
    LEAD_STATUS.find((s) => s.value === value)?.label ??
    value
  );
}

export function statusTone(value: string | null | undefined) {
  return (
    ORDER_STATUS.find((s) => s.value === value)?.tone ??
    LEAD_STATUS.find((s) => s.value === value)?.tone ??
    "info"
  );
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Monta o link do WhatsApp para um número (do cliente) com mensagem opcional. */
export function whatsappLink(numero: string, mensagem?: string) {
  let digits = onlyDigits(numero);
  if (digits.length <= 11) digits = `55${digits}`;
  const base = `https://wa.me/${digits}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Link para falar com a assistência (número central configurado acima). */
export function whatsappAssistencia(mensagem: string) {
  return `https://wa.me/${WHATSAPP_ASSISTENCIA}?text=${encodeURIComponent(mensagem)}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}