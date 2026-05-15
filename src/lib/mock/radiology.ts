import type { RadOrder } from "@/lib/types";

export const mockRadOrders: RadOrder[] = [
  { id:"r1", patient:"Arjun Singh",   uid:"MH-9942", test:"X-Ray Chest PA", modality:"X-ray", orderedBy:"Dr. Mehta",  completedAt:"09:45 AM", priority:"routine" },
  { id:"r2", patient:"Harish Patel",  uid:"MH-3456", test:"2D Echo",        modality:"USG",   orderedBy:"Dr. Iyer",   completedAt:"10:20 AM", priority:"urgent"  },
  { id:"r3", patient:"Geeta Iyer",    uid:"MH-4567", test:"CT Chest",       modality:"CT",    orderedBy:"Dr. Khan",   completedAt:"11:00 AM", priority:"stat"    },
  { id:"r4", patient:"Priya Agarwal", uid:"MH-6789", test:"USG Abdomen",    modality:"USG",   orderedBy:"Dr. Mehta",  completedAt:"11:30 AM", priority:"routine" },
];
