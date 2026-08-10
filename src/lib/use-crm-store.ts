import { useEffect, useState } from "react";
import { fetchFromCloud, saveToCloud } from "./cloud-store";
import { DEMO_CHAMADOS, DEMO_LEADS, type Chamado, type Lead, type LeadStatus } from "./crm-data";
import { getIDBItem, setIDBItem } from "./idb-storage";
import { supabase } from "./supabase";

const LEADS_STORAGE_KEY = "nexmove_leads_v6";
const OVERRIDES_STORAGE_KEY = "nexmove_lead_overrides_v2";
const CHAMADOS_STORAGE_KEY = "nexmove_chamados_v3";
const LEADS_EVENT = "nexmove_leads_updated";
const CHAMADOS_EVENT = "nexmove_chamados_updated";

declare global {
  interface Window {
    __NEXMOVE_LEADS__?: Lead[];
    __NEXMOVE_CHAMADOS__?: Chamado[];
  }
}

export function getSavedStatusOverrides(): Map<string, Partial<Lead>> {
  const overrides = new Map<string, Partial<Lead>>();
  if (typeof window === "undefined") return overrides;

  const storageKeys = [
    OVERRIDES_STORAGE_KEY,
    "nexmove_leads_v6",
    "nexmove_leads_v5",
    "nexmove_leads_v4",
    "nexmove_leads_v3",
    "nexmove_leads_v2",
    "nexmove_leads_v1",
  ];

  for (const key of storageKeys) {
    try {
      const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const lead of parsed) {
            if (lead && (lead.id || lead.telefone_cliente)) {
              const hasMoved = lead.status && lead.status !== "NOVO";
              const hasName = lead.nome_cliente && lead.nome_cliente !== "Aguardando Contato";
              const hasObs = Boolean(lead.observacao);

              if (hasMoved || hasName || hasObs) {
                const data: Partial<Lead> = {
                  ...(hasMoved ? { status: lead.status } : {}),
                  ...(hasName ? { nome_cliente: lead.nome_cliente } : {}),
                  ...(hasObs ? { observacao: lead.observacao } : {}),
                };
                if (lead.id && !overrides.has(lead.id)) overrides.set(lead.id, data);
                if (lead.telefone_cliente && !overrides.has(lead.telefone_cliente)) {
                  overrides.set(lead.telefone_cliente, data);
                }
              }
            }
          }
        } else if (typeof parsed === "object" && parsed !== null) {
          for (const [id, val] of Object.entries(parsed)) {
            if (val && typeof val === "object" && !overrides.has(id)) {
              overrides.set(id, val as Partial<Lead>);
            }
          }
        }
      }
    } catch (e) {}
  }

  return overrides;
}

export function saveLeadOverride(leadId: string, phone: string | undefined, updates: Partial<Lead>) {
  if (typeof window === "undefined") return;
  try {
    const currentMap = getSavedStatusOverrides();
    const existing = (leadId ? currentMap.get(leadId) : null) || (phone ? currentMap.get(phone) : null) || {};
    const mergedObj = { ...existing, ...updates };

    if (leadId) currentMap.set(leadId, mergedObj);
    if (phone) currentMap.set(phone, mergedObj);

    const objToStore: Record<string, Partial<Lead>> = {};
    currentMap.forEach((v, k) => {
      objToStore[k] = v;
    });

    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(objToStore));
    sessionStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(objToStore));
    setIDBItem(OVERRIDES_STORAGE_KEY, objToStore).catch(() => {});
  } catch (e) {}
}

export function mergeLeadsWithBaseline(storedLeads: Lead[]): Lead[] {
  const storedMapById = new Map<string, Lead>();
  const storedMapByPhone = new Map<string, Lead>();

  if (Array.isArray(storedLeads)) {
    for (const lead of storedLeads) {
      if (lead.id) storedMapById.set(lead.id, lead);
      if (lead.telefone_cliente) storedMapByPhone.set(lead.telefone_cliente, lead);
    }
  }

  const overridesMap = getSavedStatusOverrides();

  // Merge baseline DEMO_LEADS with stored updates and recovered overrides
  const mergedBaseline = DEMO_LEADS.map((baseLead) => {
    const stored =
      storedMapById.get(baseLead.id) ?? storedMapByPhone.get(baseLead.telefone_cliente);
    const override =
      overridesMap.get(baseLead.id) ?? overridesMap.get(baseLead.telefone_cliente);

    const finalStatus = override?.status ?? stored?.status ?? baseLead.status;
    const finalName = override?.nome_cliente ?? stored?.nome_cliente ?? baseLead.nome_cliente;
    const finalObs = override?.observacao ?? stored?.observacao ?? baseLead.observacao;

    return {
      ...baseLead,
      ...stored,
      status: finalStatus,
      nome_cliente: finalName,
      observacao: finalObs,
    };
  });

  // Preserve any custom user-added leads
  const baselineIds = new Set(DEMO_LEADS.map((l) => l.id));
  const customLeads = Array.isArray(storedLeads)
    ? storedLeads.filter(
        (l) =>
          !baselineIds.has(l.id) &&
          !DEMO_LEADS.some((b) => b.telefone_cliente === l.telefone_cliente),
      )
    : [];

  return [...customLeads, ...mergedBaseline];
}

function getSynchronousLeads(): Lead[] {
  if (typeof window === "undefined") return DEMO_LEADS;

  let rawLeads: Lead[] = DEMO_LEADS;

  if (window.__NEXMOVE_LEADS__ && window.__NEXMOVE_LEADS__.length > 0) {
    rawLeads = window.__NEXMOVE_LEADS__;
  } else {
    try {
      const sessionData = sessionStorage.getItem(LEADS_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawLeads = parsed;
        }
      } else {
        const localData = localStorage.getItem(LEADS_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawLeads = parsed;
          }
        }
      }
    } catch (e) {}
  }

  const merged = mergeLeadsWithBaseline(rawLeads);
  window.__NEXMOVE_LEADS__ = merged;
  return merged;
}

function saveLeadsMultiStore(leads: Lead[]) {
  if (typeof window === "undefined") return;

  const merged = mergeLeadsWithBaseline(leads);
  window.__NEXMOVE_LEADS__ = merged;

  try {
    const serialized = JSON.stringify(merged);
    sessionStorage.setItem(LEADS_STORAGE_KEY, serialized);
    localStorage.setItem(LEADS_STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Erro ao salvar storage:", e);
  }

  setIDBItem(LEADS_STORAGE_KEY, merged).catch(() => {});
  window.dispatchEvent(new Event(LEADS_EVENT));
}

export function useLeads() {
  const [leads, setLeadsState] = useState<Lead[]>(getSynchronousLeads);

  useEffect(() => {
    let isMounted = true;

    // Load from IndexedDB on mount
    async function loadFromIDB() {
      try {
        const idbData = await getIDBItem<Lead[]>(LEADS_STORAGE_KEY);
        if (idbData && Array.isArray(idbData) && idbData.length > 0) {
          if (isMounted) {
            const merged = mergeLeadsWithBaseline(idbData);
            window.__NEXMOVE_LEADS__ = merged;
            setLeadsState(merged);
          }
        }
      } catch (e) {}
    }

    loadFromIDB();

    // Fetch cloud state on initial mount only
    async function syncCloudData() {
      const cloudData = await fetchFromCloud();
      if (cloudData && Array.isArray(cloudData.leads) && cloudData.leads.length > 0) {
        if (isMounted) {
          const merged = mergeLeadsWithBaseline(cloudData.leads);
          window.__NEXMOVE_LEADS__ = merged;
          setLeadsState(merged);
          saveLeadsMultiStore(merged);
        }
      }
    }

    syncCloudData();

    const handleUpdate = () => {
      setLeadsState(getSynchronousLeads());
    };

    window.addEventListener(LEADS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(LEADS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const moveLead = async (leadId: string, status: LeadStatus) => {
    const current = getSynchronousLeads();
    const targetLead = current.find((l) => l.id === leadId);
    
    saveLeadOverride(leadId, targetLead?.telefone_cliente, { status });

    const updated = current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead));
    
    saveLeadsMultiStore(updated);
    setLeadsState(updated);

    saveToCloud(updated, getSynchronousChamados());

    try {
      if (targetLead?.telefone_cliente) {
        await supabase
          .from("leads")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("telefone_cliente", targetLead.telefone_cliente);
      }
    } catch (e) {}
  };

  const deleteLead = async (leadId: string) => {
    const current = getSynchronousLeads();
    const updated = current.filter((lead) => lead.id !== leadId);
    
    saveLeadsMultiStore(updated);
    setLeadsState(updated);

    saveToCloud(updated, getSynchronousChamados());

    try {
      await supabase.from("leads").delete().eq("id", leadId);
    } catch (e) {}
  };

  const addLead = async (newLead: Lead) => {
    const current = getSynchronousLeads();
    const updated = [newLead, ...current];
    
    saveLeadsMultiStore(updated);
    setLeadsState(updated);

    saveToCloud(updated, getSynchronousChamados());

    try {
      await supabase.from("leads").insert(newLead);
    } catch (e) {}
  };

  const resetLeads = () => {
    saveLeadsMultiStore(DEMO_LEADS);
    setLeadsState(DEMO_LEADS);
    saveToCloud(DEMO_LEADS, getSynchronousChamados());
  };

  const importLeads = async (newLeads: Lead[]) => {
    saveLeadsMultiStore(newLeads);
    setLeadsState(newLeads);
    saveToCloud(newLeads, getSynchronousChamados());

    try {
      await supabase.from("leads").upsert(newLeads);
    } catch (e) {}
  };

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    const current = getSynchronousLeads();
    const targetLead = current.find((l) => l.id === leadId);

    saveLeadOverride(leadId, targetLead?.telefone_cliente, updates);

    const updated = current.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead));
    saveLeadsMultiStore(updated);
    setLeadsState(updated);

    saveToCloud(updated, getSynchronousChamados());

    try {
      if (targetLead?.telefone_cliente) {
        await supabase
          .from("leads")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("telefone_cliente", targetLead.telefone_cliente);
      } else {
        await supabase
          .from("leads")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", leadId);
      }
    } catch (e) {}
  };

  return {
    leads,
    moveLead,
    deleteLead,
    addLead,
    resetLeads,
    importLeads,
    updateLead,
  };
}

function getSynchronousChamados(): Chamado[] {
  if (typeof window === "undefined") return DEMO_CHAMADOS;

  if (window.__NEXMOVE_CHAMADOS__ && window.__NEXMOVE_CHAMADOS__.length > 0) {
    return window.__NEXMOVE_CHAMADOS__;
  }

  try {
    const sessionData = sessionStorage.getItem(CHAMADOS_STORAGE_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (Array.isArray(parsed)) {
        window.__NEXMOVE_CHAMADOS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    const localData = localStorage.getItem(CHAMADOS_STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        window.__NEXMOVE_CHAMADOS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  window.__NEXMOVE_CHAMADOS__ = DEMO_CHAMADOS;
  return DEMO_CHAMADOS;
}

function saveChamadosMultiStore(chamados: Chamado[]) {
  if (typeof window === "undefined") return;

  window.__NEXMOVE_CHAMADOS__ = chamados;

  try {
    const serialized = JSON.stringify(chamados);
    sessionStorage.setItem(CHAMADOS_STORAGE_KEY, serialized);
    localStorage.setItem(CHAMADOS_STORAGE_KEY, serialized);
  } catch (e) {}

  setIDBItem(CHAMADOS_STORAGE_KEY, chamados).catch(() => {});
  window.dispatchEvent(new Event(CHAMADOS_EVENT));
}

export function useChamados() {
  const [chamados, setChamadosState] = useState<Chamado[]>(getSynchronousChamados);

  useEffect(() => {
    let isMounted = true;

    async function loadFromIDB() {
      try {
        const idbData = await getIDBItem<Chamado[]>(CHAMADOS_STORAGE_KEY);
        if (idbData && Array.isArray(idbData)) {
          if (isMounted) {
            window.__NEXMOVE_CHAMADOS__ = idbData;
            setChamadosState(idbData);
          }
        }
      } catch (e) {}
    }

    loadFromIDB();

    const handleUpdate = () => {
      setChamadosState(getSynchronousChamados());
    };

    window.addEventListener(CHAMADOS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(CHAMADOS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addChamado = async (newChamado: Chamado) => {
    const current = getSynchronousChamados();
    const updated = [newChamado, ...current];
    saveChamadosMultiStore(updated);
    setChamadosState(updated);
    saveToCloud(getSynchronousLeads(), updated);

    try {
      await supabase.from("chamados").insert(newChamado);
    } catch (e) {}
  };

  const resolveChamado = async (chamadoId: string) => {
    const current = getSynchronousChamados();
    const updated = current.map((c) =>
      c.id === chamadoId ? { ...c, status: "RESOLVIDO" as const } : c,
    );
    saveChamadosMultiStore(updated);
    setChamadosState(updated);
    saveToCloud(getSynchronousLeads(), updated);

    try {
      await supabase.from("chamados").update({ status: "RESOLVIDO" }).eq("id", chamadoId);
    } catch (e) {}
  };

  return {
    chamados,
    addChamado,
    resolveChamado,
  };
}
