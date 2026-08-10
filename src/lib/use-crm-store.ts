import { useEffect, useState } from "react";
import { DEMO_CHAMADOS, DEMO_LEADS, type Chamado, type Lead, type LeadStatus } from "./crm-data";
import { supabase } from "./supabase";

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
    let isMounted = true;

    async function fetchFromSupabase() {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          if (isMounted) {
            setLeadsState(data as Lead[]);
            saveLeadsToStorage(data as Lead[]);
          }
        }
      } catch (e) {
        console.warn("Supabase leads fallback to localStorage:", e);
      }
    }

    fetchFromSupabase();

    const handleUpdate = () => {
      setLeadsState(getInitialLeads());
    };

    window.addEventListener(LEADS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    const channel = supabase
      .channel("public:leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          fetchFromSupabase();
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener(LEADS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  const moveLead = async (leadId: string, status: LeadStatus) => {
    const current = getInitialLeads();
    const updated = current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead));
    saveLeadsToStorage(updated);
    setLeadsState(updated);

    try {
      await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", leadId);
    } catch (e) {
      console.error("Erro ao atualizar status no Supabase:", e);
    }
  };

  const deleteLead = async (leadId: string) => {
    const current = getInitialLeads();
    const updated = current.filter((lead) => lead.id !== leadId);
    saveLeadsToStorage(updated);
    setLeadsState(updated);

    try {
      await supabase.from("leads").delete().eq("id", leadId);
    } catch (e) {
      console.error("Erro ao deletar lead no Supabase:", e);
    }
  };

  const addLead = async (newLead: Lead) => {
    const current = getInitialLeads();
    const updated = [newLead, ...current];
    saveLeadsToStorage(updated);
    setLeadsState(updated);

    try {
      await supabase.from("leads").insert(newLead);
    } catch (e) {
      console.error("Erro ao inserir lead no Supabase:", e);
    }
  };

  const resetLeads = () => {
    saveLeadsToStorage(DEMO_LEADS);
    setLeadsState(DEMO_LEADS);
  };

  const importLeads = async (newLeads: Lead[]) => {
    saveLeadsToStorage(newLeads);
    setLeadsState(newLeads);

    try {
      await supabase.from("leads").upsert(newLeads);
    } catch (e) {
      console.error("Erro ao importar leads no Supabase:", e);
    }
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
    let isMounted = true;

    async function fetchChamadosFromSupabase() {
      try {
        const { data, error } = await supabase
          .from("chamados")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          if (isMounted) {
            setChamadosState(data as Chamado[]);
            saveChamadosToStorage(data as Chamado[]);
          }
        }
      } catch (e) {
        console.warn("Supabase chamados fallback:", e);
      }
    }

    fetchChamadosFromSupabase();

    const handleUpdate = () => {
      setChamadosState(getInitialChamados());
    };

    window.addEventListener(CHAMADOS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    const channel = supabase
      .channel("public:chamados")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chamados" },
        () => {
          fetchChamadosFromSupabase();
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener(CHAMADOS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      supabase.removeChannel(channel);
    };
  }, []);

  const addChamado = async (newChamado: Chamado) => {
    const current = getInitialChamados();
    const updated = [newChamado, ...current];
    saveChamadosToStorage(updated);
    setChamadosState(updated);

    try {
      await supabase.from("chamados").insert(newChamado);
    } catch (e) {
      console.error("Erro ao criar chamado no Supabase:", e);
    }
  };

  const resolveChamado = async (chamadoId: string) => {
    const current = getInitialChamados();
    const updated = current.map((c) =>
      c.id === chamadoId ? { ...c, status: "RESOLVIDO" as const } : c,
    );
    saveChamadosToStorage(updated);
    setChamadosState(updated);

    try {
      await supabase.from("chamados").update({ status: "RESOLVIDO" }).eq("id", chamadoId);
    } catch (e) {
      console.error("Erro ao resolver chamado no Supabase:", e);
    }
  };

  return {
    chamados,
    addChamado,
    resolveChamado,
  };
}
