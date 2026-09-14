import { X, FileSearch } from "lucide-react";
import { CanonicalBatteryField } from "@/lib/types";
export function SourcePanel({field,onClose}:{field:CanonicalBatteryField|null,onClose:()=>void}) {
  if(!field) return null;
  return <><button aria-label="Закрыть" onClick={onClose} className="fixed inset-0 z-40 cursor-default bg-slate-900/20"/><aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white p-7 shadow-2xl">
    <div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2 text-blue-600"><FileSearch/></span><h2 className="text-xl font-bold">Источник данных</h2></div><button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X/></button></div>
    <dl className="space-y-6"><Info k="Поле" v={field.name_ru}/><Info k="Значение" v={`${field.value??"—"} ${field.unit??""}`}/><Info k="Документ" v={field.sourceDocument??"Источник отсутствует"}/>{field.sourcePage&&<Info k="Страница" v={String(field.sourcePage)}/>}<Info k="Найденный фрагмент" v={field.fragment?`“${field.fragment}”`:"—"}/><Info k="Уверенность" v={field.confidence?`${field.confidence}%`:"—"}/><Info k="Доступ" v={field.visibility}/></dl>
    {field.candidates&&<div className="mt-8 border-t pt-6"><p className="label mb-3">Найденные варианты</p>{field.candidates.map(c=><div key={c.value} className="mb-3 rounded-xl bg-rose-50 p-4 text-sm"><b>{c.value} {c.unit}</b><p className="mt-1 text-rose-700">{c.sourceDocument}</p></div>)}</div>}
  </aside></>;
}
function Info({k,v}:{k:string,v:string}) { return <div><dt className="label mb-1.5">{k}</dt><dd className="text-sm leading-6 text-slate-800">{v}</dd></div> }
