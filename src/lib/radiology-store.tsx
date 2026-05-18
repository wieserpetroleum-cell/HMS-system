import * as React from "react";
import type {
  RadiologyOrder,
  RadiologyReport,
  RadiologyStudy,
  ReportSection,
} from "@/lib/types";
import { mockOrders, mockReports, mockStudies } from "@/lib/mock/radiology";

interface Ctx {
  orders: RadiologyOrder[];
  studies: RadiologyStudy[];
  reports: RadiologyReport[];
  addOrder: (input: Omit<RadiologyOrder, "id" | "orderNo" | "status" | "orderedAt"> & {
    status?: RadiologyOrder["status"];
    orderedAt?: string;
  }) => RadiologyOrder;
  scheduleOrder: (id: string, scheduledAt: string, assignedRadiologist?: string) => void;
  startAcquisition: (id: string) => void;
  completeAcquisition: (id: string, payload: { series: { description: string; imageCount: number }[]; technologist: string; notes?: string }) => void;
  saveReportDraft: (studyId: string, sections: ReportSection[], by: string, criticalFinding?: boolean, templateId?: string) => void;
  verifyReport: (studyId: string, by: string) => void;
  amendReport: (studyId: string, sections: ReportSection[], by: string, reason: string) => void;
  cancelOrder: (id: string, reason: string) => void;
  assignRadiologist: (id: string, radiologist: string) => void;
  getOrder: (id: string) => RadiologyOrder | undefined;
  getStudyByOrderId: (orderId: string) => RadiologyStudy | undefined;
  getReportByStudyId: (studyId: string) => RadiologyReport | undefined;
  getByPatientUid: (uid: string) => RadiologyOrder[];
}

const RadiologyContext = React.createContext<Ctx | null>(null);

function nextOrderNo(seq: number) {
  return `RAD-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`;
}

export function RadiologyProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState<RadiologyOrder[]>(mockOrders);
  const [studies, setStudies] = React.useState<RadiologyStudy[]>(mockStudies);
  const [reports, setReports] = React.useState<RadiologyReport[]>(mockReports);

  const addOrder = React.useCallback<Ctx["addOrder"]>(
    (input) => {
      const order: RadiologyOrder = {
        ...input,
        id: `ro${Date.now()}`,
        orderNo: nextOrderNo(orders.length + 1),
        orderedAt: input.orderedAt ?? new Date().toISOString(),
        status: input.status ?? (input.scheduledAt ? "scheduled" : "ordered"),
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [orders.length],
  );

  const scheduleOrder = React.useCallback<Ctx["scheduleOrder"]>((id, scheduledAt, assignedRadiologist) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "scheduled", scheduledAt, assignedRadiologist: assignedRadiologist ?? o.assignedRadiologist } : o)),
    );
  }, []);

  const startAcquisition = React.useCallback<Ctx["startAcquisition"]>((id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "in-acquisition" } : o)));
  }, []);

  const completeAcquisition = React.useCallback<Ctx["completeAcquisition"]>((id, payload) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "acquired" } : o)));
    setStudies((prev) => {
      const existing = prev.find((s) => s.orderId === id);
      const series = payload.series.map((s, idx) => ({
        id: `${id}-s${idx + 1}`,
        description: s.description,
        imageCount: s.imageCount,
        thumbnailHint: `${id}-${idx}`,
      }));
      if (existing) {
        return prev.map((s) => (s.orderId === id ? { ...s, series, acquiredAt: new Date().toISOString(), technologist: payload.technologist, notes: payload.notes } : s));
      }
      return [...prev, {
        id: `st-${id}`,
        orderId: id,
        accessionNo: `ACC-${id.toUpperCase()}`,
        series,
        acquiredAt: new Date().toISOString(),
        acquiredBy: payload.technologist,
        technologist: payload.technologist,
        notes: payload.notes,
      }];
    });
  }, []);

  const saveReportDraft = React.useCallback<Ctx["saveReportDraft"]>((studyId, sections, by, criticalFinding, templateId) => {
    const order = orders.find((o) => `st-${o.id}` === studyId || studies.find((s) => s.id === studyId)?.orderId === o.id);
    setReports((prev) => {
      const existing = prev.find((r) => r.studyId === studyId);
      if (existing) {
        return prev.map((r) =>
          r.studyId === studyId
            ? { ...r, sections, draftedBy: by, draftedAt: new Date().toISOString(), criticalFinding: criticalFinding ?? r.criticalFinding, templateId: templateId ?? r.templateId }
            : r,
        );
      }
      return [
        ...prev,
        {
          id: `rep-${studyId}`,
          studyId,
          templateId,
          sections,
          criticalFinding: criticalFinding ?? false,
          draftedBy: by,
          draftedAt: new Date().toISOString(),
          version: 1,
        },
      ];
    });
    if (order && order.status !== "verified" && order.status !== "delivered") {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "reporting" } : o)));
    }
  }, [orders, studies]);

  const verifyReport = React.useCallback<Ctx["verifyReport"]>((studyId, by) => {
    setReports((prev) =>
      prev.map((r) => (r.studyId === studyId ? { ...r, verifiedBy: by, verifiedAt: new Date().toISOString() } : r)),
    );
    const study = studies.find((s) => s.id === studyId);
    if (study) {
      setOrders((prev) => prev.map((o) => (o.id === study.orderId ? { ...o, status: "verified" } : o)));
    }
  }, [studies]);

  const amendReport = React.useCallback<Ctx["amendReport"]>((studyId, sections, by, reason) => {
    setReports((prev) =>
      prev.map((r) =>
        r.studyId === studyId
          ? {
              ...r,
              sections,
              amendedFrom: r.id,
              amendmentReason: reason,
              version: r.version + 1,
              draftedBy: by,
              draftedAt: new Date().toISOString(),
              verifiedBy: by,
              verifiedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  }, []);

  const cancelOrder = React.useCallback<Ctx["cancelOrder"]>((id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
  }, []);

  const assignRadiologist = React.useCallback<Ctx["assignRadiologist"]>((id, radiologist) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, assignedRadiologist: radiologist } : o)));
  }, []);

  const getOrder = React.useCallback((id: string) => orders.find((o) => o.id === id), [orders]);
  const getStudyByOrderId = React.useCallback((orderId: string) => studies.find((s) => s.orderId === orderId), [studies]);
  const getReportByStudyId = React.useCallback((studyId: string) => reports.find((r) => r.studyId === studyId), [reports]);
  const getByPatientUid = React.useCallback((uid: string) => orders.filter((o) => o.patientUid === uid), [orders]);

  const value = React.useMemo<Ctx>(
    () => ({
      orders, studies, reports,
      addOrder, scheduleOrder, startAcquisition, completeAcquisition,
      saveReportDraft, verifyReport, amendReport, cancelOrder, assignRadiologist,
      getOrder, getStudyByOrderId, getReportByStudyId, getByPatientUid,
    }),
    [orders, studies, reports, addOrder, scheduleOrder, startAcquisition, completeAcquisition, saveReportDraft, verifyReport, amendReport, cancelOrder, assignRadiologist, getOrder, getStudyByOrderId, getReportByStudyId, getByPatientUid],
  );

  return <RadiologyContext.Provider value={value}>{children}</RadiologyContext.Provider>;
}

export function useRadiology() {
  const ctx = React.useContext(RadiologyContext);
  if (!ctx) throw new Error("useRadiology must be used within RadiologyProvider");
  return ctx;
}