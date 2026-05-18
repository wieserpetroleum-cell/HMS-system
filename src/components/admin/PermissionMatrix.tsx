import * as React from "react";
import type { PermissionModule, RoleDef } from "@/lib/types";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "@/lib/mock/admin";
import { Checkbox } from "@/components/ui/checkbox";

export function PermissionMatrix({
  role,
  onChange,
  readOnly,
}: {
  role: RoleDef;
  onChange?: (next: RoleDef) => void;
  readOnly?: boolean;
}) {
  const toggle = (m: PermissionModule, a: string) => {
    if (!onChange || readOnly) return;
    const cur = role.permissions[m]?.[a] ?? false;
    onChange({
      ...role,
      permissions: {
        ...role.permissions,
        [m]: { ...(role.permissions[m] ?? {}), [a]: !cur },
      },
    });
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide">Module</th>
            {PERMISSION_ACTIONS.map((a) => (
              <th key={a} className="px-2 py-2 text-center font-semibold uppercase tracking-wide">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((m) => (
            <tr key={m} className="border-t">
              <td className="px-3 py-2 capitalize">{m}</td>
              {PERMISSION_ACTIONS.map((a) => (
                <td key={a} className="px-2 py-2 text-center">
                  <Checkbox
                    checked={!!role.permissions[m]?.[a]}
                    disabled={readOnly}
                    onCheckedChange={() => toggle(m, a)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}