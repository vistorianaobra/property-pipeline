import { useEffect, useState } from "react";
import { fetchFromCloud, saveToCloud } from "./cloud-store";
import { DEMO_CHAMADOS, DEMO_LEADS, type Chamado, type Lead, type LeadStatus } from "./crm-data";
import { getIDBItem, setIDBItem } from "./idb-storage";
import { supabase } from "./supabase";

const LEADS_STORAGE_KEY = "nexmove_leads_v4";
const CHAMADOS_STORAGE_KEY = "nexmove_chamados_v3";
const LEADS_EVENT = "nexmove_leads_updated";
const CHAMADOS_EVENT = "nexmove_chamados_updated";

declare global {
  interface Window {
    __NEXMOVE_LEADS__?: Lead[];
    __NEXMOVE_CHAMADOS__?: Chamado[];
  }
}

function getSynchronousLeads(): Lead[] {
  if (typeof window === "undefined") return DEMO_LEADS;

  // 1. Check in-memory global cache
  if (window.__NEXMOVE_LEADS__ && window.__NEXMOVE_LEADS__.length > 0) {
    return window.__NEXMOVE_LEADS__;
  }

  // 2. Check sessionStorage
  try {
    const sessionData = sessionStorage.getItem(LEADS_STORAGE_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        window.__NEXMOVE_LEADS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  // 3. Check localStorage
  try {
    const localData = localStorage.getItem(LEADS_STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        window.__NEXMOVE_LEADS__ = parsed;
        try {
          sessionStorage.setItem(LEADS_STORAGE_KEY, localData);
        } catch (_) {}
        return parsed;
      }
    }
  } catch (e) {}

  // 4. Fallback to default leads array
  window.__NEXMOVE_LEADS__ = DEMO_LEADS;
  return DEMO_LEADS;
}

function saveLeadsMultiStore(leads: Lead[]) {
  if (typeof window === "undefined") return;

  window.__NEXMOVE_LEADS__ = leads;

  try {
    const serialized = JSON.stringify(leads);
    sessionStorage.setItem(LEADS_STORAGE_KEY, serialized);
    localStorage.setItem(LEADS_STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Erro ao salvar storage:", e);
  }

  setIDBItem(LEADS_STORAGE_KEY, leads).catch(() => {});
  window.dispatchEvent(new Event(LEADS_EVENT));
}

export function useLeads() {
  const [leads, setLeadsState] = useState<Lead[]>(getSynchronousLeads);

  useEffect(() => {
    let isMounted = true;

    // Load from IndexedDB
    async function loadFromIDB() {
      try {
        const idbData = await getIDBItem<Lead[]>(LEADS_STORAGE_KEY);
        if (idbData && Array.isArray(idbData) && idbData.length > 0) {
          if (isMounted) {
            window.__NEXMOVE_LEADS__ = idbData;
            setLeadsState(idbData);
          }
        }
      } catch (e) {}
    }

    loadFromIDB();

    // Sync cloud data across Incognito tabs and devices
    async function syncCloudData() {
      const cloudData = await fetchFromCloud();
      if (cloudData && Array.isArray(cloudData.leads) && cloudData.leads.length > 0) {
        if (isMounted) {
          // Check if cloud data has different lead statuses
          const currentLocalStr = JSON.stringify(window.__NEXMOVE_LEADS__ || []);
          const cloudDataStr = JSON.stringify(cloudData.leads);

          if (currentLocalStr !== cloudDataStr) {
            window.__NEXMOVE_LEADS__ = cloudData.leads;
            setLeadsState(cloudData.leads);
            saveLeadsMultiStore(cloudData.leads);
          }
        }
      }
    }

    syncCloudData();

    // Poll cloud store every 3 seconds for real-time cross-browser / incognito / mobile sync
    const intervalId = setInterval(syncCloudData, 3000);

    const handleUpdate = () => {
      setLeadsState(getSynchronousLeads());
    };

    window.addEventListener(LEADS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener(LEADS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const moveLead = async (leadId: string, status: LeadStatus) => {
    const current = getSynchronousLeads();
    const updated = current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead));
    
    saveLeadsMultiStore(updated);
    setLeadsState(updated);

    // Save real-time update to cloud store
    saveToCloud(updated, getSynchronousChamados());

    try {
      const targetLead = current.find((l) => l.id === leadId);
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

  return {
    leads,
    moveLead,
    deleteLead,
    addLead,
    resetLeads,
    importLeads,
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
