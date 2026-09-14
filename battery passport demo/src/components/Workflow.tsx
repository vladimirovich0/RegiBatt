import { Check } from "lucide-react";
const steps=["Документы","Анализ","Недостающие данные","Проверка","DPP","EU Registry","QR"];
export function Workflow({active}:{active:number}) { return <div className="card overflow-x-auto p-4"><div className="flex min-w-[760px] items-center">
  {steps.map((s,i)=><div className="flex flex-1 items-center" key={s}><div className="flex flex-col items-center gap-2 text-center">
    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i<active?"bg-emerald-500 text-white":i===active?"bg-blue-600 text-white ring-4 ring-blue-100":"bg-slate-100 text-slate-400"}`}>{i<active?<Check size={15}/>:i+1}</div>
    <span className={`whitespace-nowrap text-xs ${i<=active?"font-semibold text-slate-700":"text-slate-400"}`}>{s}</span></div>
    {i<steps.length-1&&<div className={`mx-2 h-px flex-1 ${i<active?"bg-emerald-400":"bg-slate-200"}`}/>}</div>)}
  </div></div> }
