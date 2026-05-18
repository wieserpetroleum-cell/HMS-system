import * as React from "react";

export type AuditEntry = {
  id: string;
  action: string;
  module: string;
  user: string;
  details: string;
  timestamp: string;
};

type AuditContextType = {
  entries: AuditEntry[];
  addEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
};

const AuditContext = React.createContext<AuditContextType>({
  entries: [],
  addEntry: () => {},
});

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<AuditEntry[]>([]);
  const addEntry = (entry: Omit<AuditEntry, "id" | "timestamp">) => {
    setEntries(prev => [{
      ...entry,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
    }, ...prev]);
  };
  return <AuditContext.Provider value={{ entries, addEntry }}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  return React.useContext(AuditContext);
}
