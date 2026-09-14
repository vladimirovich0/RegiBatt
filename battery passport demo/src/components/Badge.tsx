import { FieldStatus } from "@/lib/types";
const labels:Record<FieldStatus,string>={FOUND:"Найдено",MISSING:"Отсутствует",CONFLICT:"Конфликт",APPROVED:"Подтверждено"};
const colors:Record<FieldStatus,string>={FOUND:"bg-emerald-50 text-emerald-700",MISSING:"bg-amber-50 text-amber-700",CONFLICT:"bg-rose-50 text-rose-700",APPROVED:"bg-blue-50 text-blue-700"};
export function Badge({status}:{status:FieldStatus}) { return <span className={`status ${colors[status]}`}>{labels[status]}</span>; }
