import { useEffect, useState } from "react";
import { DEMO_CHAMADOS, DEMO_LEADS, type Chamado, type Lead, type LeadStatus } from "./crm-data";

const LEADS_STORAGE_KEY = "nexmove_leads_v2";
const CHAMADOS_STORAGE_KEY = "nexmove_chamados_v1";
const LEADS_EVENT = "nexmove_leads_updated";
const CHAMADOS_EVENT = "nexmove_chamados_updated";

function getInitialLeads(): Lead[] {
  if (typeof window === "undefined") return DEMO_LEADS;
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar leads do localStorage:", e);
  }
  return DEMO_LEADS;
}

function saveLeadsToStorage(leads: Lead[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new Event(LEADS_EVENT));
  } catch (e) {
    console.error("Erro ao salvar leads no localStorage:", e);
  }
}

export function useLeads() {
  const [leads, setLeadsState] = useState<Lead[]>(getInitialLeads);

  useEffect(() => {
    const handleUpdate = () => {
      setLeadsState(getInitialLeads());
    };

    window.addEventListener(LEADS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(LEADS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const moveLead = (leadId: string, status: LeadStatus) => {
    const current = getInitialLeads();
    const updated = current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead));
    saveLeadsToStorage(updated);
    setLeadsState(updated);
  };

  const deleteLead = (leadId: string) => {
    const current = getInitialLeads();
    const updated = current.filter((lead) => lead.id !== leadId);
    saveLeadsToStorage(updated);
    setLeadsState(updated);
  };

  const addLead = (newLead: Lead) => {
    const current = getInitialLeads();
    const updated = [newLead, ...current];
    saveLeadsToStorage(updated);
    setLeadsState(updated);
  };

  const resetLeads = () => {
    saveLeadsToStorage(DEMO_LEADS);
    setLeadsState(DEMO_LEADS);
  };

  const importLeads = (newLeads: Lead[]) => {
    saveLeadsToStorage(newLeads);
    setLeadsState(newLeads);
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

function getInitialChamados(): Chamado[] {
  if (typeof window === "undefined") return DEMO_CHAMADOS;
  try {
    const stored = localStorage.getItem(CHAMADOS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar chamados:", e);
  }
  return DEMO_CHAMADOS;
}

function saveChamadosToStorage(chamados: Chamado[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAMADOS_STORAGE_KEY, JSON.stringify(chamados));
    window.dispatchEvent(new Event(CHAMADOS_EVENT));
  } catch (e) {
    console.error("Erro ao salvar chamados:", e);
  }
}

export function useChamados() {
  const [chamados, setChamadosState] = useState<Chamado[]>(getInitialChamados);

  useEffect(() => {
    const handleUpdate = () => {
      setChamadosState(getInitialChamados());
    };

    window.addEventListener(CHAMADOS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(CHAMADOS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addChamado = (newChamado: Chamado) => {
    const current = getInitialChamados();
    const updated = [newChamado, ...current];
    saveChamadosToStorage(updated);
    setChamadosState(updated);
  };

  const resolveChamado = (chamadoId: string) => {
    const current = getInitialChamados();
    const updated = current.map((c) =>
      c.id === chamadoId ? { ...c, status: "RESOLVIDO" as const } : c,
    );
    saveChamadosToStorage(updated);
    setChamadosState(updated);
  };

  return {
    chamados,
    addChamado,
    resolveChamado,
  };
}
