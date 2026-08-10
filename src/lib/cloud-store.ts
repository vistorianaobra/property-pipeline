// Real-time Cloud Sync Store Engine for NEXMOVE CRM
import type { Chamado, Lead } from "./crm-data";

const CLOUD_BLOB_ID = "019fecc0-b504-75d0-8fd8-6a3469cc3766";
const CLOUD_ENDPOINT = `https://jsonblob.com/api/jsonBlob/${CLOUD_BLOB_ID}`;

interface CloudPayload {
  leads: Lead[];
  chamados?: Chamado[];
  updated_at: string;
}

export async function fetchFromCloud(): Promise<{ leads: Lead[]; chamados: Chamado[] } | null> {
  try {
    const res = await fetch(CLOUD_ENDPOINT, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) return null;
    const data: CloudPayload = await res.json();
    if (data && Array.isArray(data.leads) && data.leads.length > 0) {
      return {
        leads: data.leads,
        chamados: Array.isArray(data.chamados) ? data.chamados : [],
      };
    }
  } catch (e) {
    console.warn("Erro ao buscar dados da nuvem:", e);
  }
  return null;
}

export async function saveToCloud(leads: Lead[], chamados: Chamado[] = []): Promise<boolean> {
  try {
    const payload: CloudPayload = {
      leads,
      chamados,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(CLOUD_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (e) {
    console.warn("Erro ao salvar dados na nuvem:", e);
    return false;
  }
}
