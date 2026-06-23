import { Link } from "react-router-dom";
import type { RadiologyOrder } from "@/lib/types";
import { OrderStatusPill, PriorityBadge } from "./StatusPill";
import { ModalityIcon } from "./ModalityIcon";
import { TatGauge } from "./TatGauge";
import { findStudy } from "@/lib/mock/radiology-catalog";

export function WorklistRow({ order }: { order: RadiologyOrder }) {
  const cat = findStudy(order.studyCode);
  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/30">
      <td className="px-4 py-2 font-mono text-[11px]">
        <Link to={`/radiology/orders/${order.id}`} className="text-primary hover:underline">
          {order.orderNo}
        </Link>
      </td>
      <td className="px-4 py-2">
        <div className="font-medium">{order.patientName}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{order.patientUid}</div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <ModalityIcon modality={order.modality} />
          <div>
            <div className="text-sm">{order.studyName}</div>
            <div className="text-[10px] text-muted-foreground">{order.bodyPart}{order.contrast ? " · +contrast" : ""}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-2"><PriorityBadge priority={order.priority} /></td>
      <td className="px-4 py-2 text-xs text-muted-foreground">{order.orderedBy}</td>
      <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(order.orderedAt).toLocaleString()}</td>
      <td className="px-4 py-2"><OrderStatusPill status={order.status} /></td>
      <td className="px-4 py-2">
        {cat ? <TatGauge orderedAt={order.orderedAt} targetMin={cat.targetTatMin} /> : "—"}
      </td>
      <td className="px-4 py-2 text-xs text-muted-foreground">{order.assignedRadiologist ?? "—"}</td>
    </tr>
  );
}
