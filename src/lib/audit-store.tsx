import * as React from "react";
import { AuditRecord } from "@/lib/types";
import { mockAuditRecords } from "@/lib/mock/admin";

type AuditContextType = {
  records: AuditRecord[];
  addRecord: (record: Omit<AuditRecord, "id" | "at">) => void;
};

const AuditContext = React.createContext<AuditContextType>({
  records: [],
  addRecord: () => {},
});

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = React.useState<AuditRecord[]>(mockAuditRecords);

  const addRecord = React.useCallback((record: Omit<AuditRecord, "id" | "at">) => {
    setRecords(prev => [{
      ...record,
      id: Math.random().toString(36).slice(2),
      at: new Date().toISOString(),
    }, ...prev]);
  }, []);

  return (
    <AuditContext.Provider value={{ records, addRecord }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  return React.useContext(AuditContext);
}
