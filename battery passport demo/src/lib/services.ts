import { ApprovedDataset, BatteryDataExtractor, CanonicalBatteryField, DppProvider, EuRegistryProvider, IndividualPassport, RawDocument, RegistryRecord, SupplierCommunicationService } from "./types";
import { initialFields } from "./demo-data";

export class DemoBatteryDataExtractor implements BatteryDataExtractor {
  async extract(documents: RawDocument[]) {
    const parsed = await Promise.all(documents.filter(d=>d.url).map(async d=>[d.name,await readDocument(d)] as const));
    const byName = Object.fromEntries(parsed); const all = Object.values(byName).join("\n");
    const take=(pattern:RegExp)=>pattern.exec(all)?.[1]?.trim()??null;
    const values:Record<string,string|null>={
      model:take(/Battery model:\s*(PC-4815)/i), category:take(/Battery category:\s*(LMT)/i), product_name:take(/Product name:\s*([^\n]+)/i),
      manufacturer:take(/Manufacturer:\s*(Shenzhen PowerCell Technology Co\., Ltd\.)/i), country:take(/Manufacturing location:\s*Shenzhen,\s*(China)/i), city:take(/manufacturing_city[, :]\s*(Shenzhen)/i),
      address:take(/manufacturer_address[, :]\s*([^\n]+)/i), voltage:take(/Nominal voltage:\s*([\d.]+)/i), capacity:take(/Rated capacity:\s*([\d.]+)/i), energy:take(/Nominal energy:\s*([\d.]+)/i),
      chemistry:take(/Chemistry[, :]\s*(NMC)/i), configuration:take(/Cell configuration[, :]\s*(13S5P)/i), temperature:take(/Operating temperature[, :]\s*(-20 to \+60)/i)?.replace(" to ","…")??null,
      un_test:take(/Test reference:\s*([^\n]+)/i), operator:take(/Economic operator:\s*([^\n]+)/i), declaration:take(/Declaration number:\s*([^\n]+)/i), supplier_email:take(/supplier_email[, :]\s*([^\n]+)/i), market:take(/Market:\s*([^\n]+)/i)?.replace("Poland and Germany","Польша, Германия")??null,
      cathode:null,recycled_lithium:null,dismantling:null,spare_parts:null,weight:null
    };
    const weights=[...all.matchAll(/Battery weight[, :]\s*([\d.]+)/gi)].map(m=>m[1]);
    if(weights.length) values.weight=[...new Set(weights)].join(" / ");
    return initialFields().map(f=>({...f,value:values[f.id]??null,status:f.id==="weight"&&weights.length>1?"CONFLICT":values[f.id]===null?"MISSING":"FOUND"} as CanonicalBatteryField));
  }
  async extractSupplierResponse(): Promise<Partial<Record<string, string>>> {
    const text=await readDocument({id:"response",name:"supplier_additional_data.xlsx",type:"XLSX",size:"",url:"/demo-documents/supplier_additional_data.xlsx"});
    const take=(label:string)=>new RegExp(`${label}[, :]\\s*([^\\n]+)`,"i").exec(text)?.[1]?.trim();
    return { cathode:take("Cathode composition"), recycled_lithium:take("Recycled lithium content")?.replace("%",""), dismantling:take("Dismantling instructions"), spare_parts:take("Spare part reference") };
  }
}

const fixtureText:Record<string,string>={
  "battery_datasheet.pdf":"Battery model: PC-4815\nBattery category: LMT\nProduct name: PowerCell Urban 48\nNominal voltage: 48 V\nRated capacity: 15 Ah\nNominal energy: 720 Wh\nBattery weight: 3.6 kg",
  "un38_3_test_report.pdf":"Manufacturer: Shenzhen PowerCell Technology Co., Ltd.\nBattery model: PC-4815\nTest reference: UN38-PC4815-2026-118\nManufacturing location: Shenzhen, China",
  "battery_specifications.xlsx":"Chemistry: NMC\nCell configuration: 13S5P\nOperating temperature: -20 to +60: °C\nBattery weight: 3.55: kg",
  "supplier_information.csv":"manufacturer_address,88 Longhua Technology Road\nmanufacturing_city,Shenzhen\nmanufacturing_country,China\ncontact_person,Li Wei\nsupplier_email,compliance@powercell-demo.cn",
  "declaration_of_conformity.pdf":"Economic operator: VoltRide Sp. z o.o.\nProduct model: PC-4815\nDeclaration number: VR-DOC-2027-041\nMarket: Poland and Germany",
  "supplier_additional_data.xlsx":"Cathode composition: NMC 811\nRecycled lithium content: 12%\nDismantling instructions: Document DI-PC4815-v2\nSpare part reference: PC4815-HOUSING-01"
};

async function readDocument(document:RawDocument):Promise<string>{
  if(typeof window==="undefined"||!document.url)return fixtureText[document.name]??"";
  try{
    const response=await fetch(document.url);const ext=document.name.split(".").pop()?.toLowerCase();
    if(ext==="csv"||ext==="txt")return await response.text();
    if(ext==="xlsx"){
      const XLSX=await import("xlsx");const workbook=XLSX.read(await response.arrayBuffer());
      return workbook.SheetNames.flatMap(name=>(XLSX.utils.sheet_to_json(workbook.Sheets[name],{header:1}) as unknown[][]).map(row=>row.join(": "))).join("\n");
    }
    if(ext==="pdf"){
      const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc="/pdf.worker.min.mjs";
      const pdf=await pdfjs.getDocument({data:new Uint8Array(await response.arrayBuffer())}).promise;const pages:string[]=[];
      for(let i=1;i<=pdf.numPages;i++){const content=await (await pdf.getPage(i)).getTextContent();pages.push(content.items.map(item=>("str" in item?item.str:"")).join(" "))}
      return pages.join("\n");
    }
  }catch{}
  return fixtureText[document.name]??"";
}
export class DemoSupplierCommunicationService implements SupplierCommunicationService {
  createRequest(_fields: CanonicalBatteryField[]) {
    return `To: compliance@powercell-demo.cn\nSubject: Required Battery Passport information for PC-4815\n\nDear Shenzhen PowerCell team,\n\nFor battery model PC-4815, please provide the following missing information:\n\n1. Cathode composition\n2. Recycled lithium content\n3. Dismantling instructions\n4. Spare-part information\n\nPlease complete the attached template.\n\nBest regards,\nVoltRide Sp. z o.o.`;
  }
  async simulateSend() { return { sentAt: new Date().toISOString() }; }
}
export class LocalDppProvider implements DppProvider {
  async createPassports(dataset: ApprovedDataset, quantity: number): Promise<IndividualPassport[]> {
    const now = new Date().toISOString();
    return Array.from({ length: quantity }, (_, i) => {
      const serial = `PC4815-2027-${String(i + 1).padStart(6,"0")}`;
      return { passportId:`DPP-PC4815-${String(i+1).padStart(6,"0")}`, serialNumber:serial, uniqueProductIdentifier:serial,
        modelId:"PC-4815", datasetVersion:dataset.version, createdAt:now, publicPassportUrl:`/passport/${serial}`, registryStatus:"NOT_REGISTERED" };
    });
  }
}
export class MockEuRegistryProvider implements EuRegistryProvider {
  async register(passports: IndividualPassport[]): Promise<RegistryRecord[]> {
    return passports.map((p,i) => ({ passportId:p.passportId, registrationId:`EU-DPP-DEMO-2027-${String(i+1).padStart(6,"0")}`, status:"DEMO_REGISTERED", registeredAt:new Date().toISOString() }));
  }
}

export function buildDataset(fields: CanonicalBatteryField[]): ApprovedDataset {
  const v = (id:string) => fields.find(f=>f.id===id)?.value;
  return { version:"1.0", approvedAt:new Date().toISOString(), battery:{
    model:v("model"), category:v("category"), manufacturer:{ name:v("manufacturer"), country:v("country"), city:v("city") },
    technical:{ nominalVoltage:{value:Number(v("voltage")),unit:"V"}, ratedCapacity:{value:Number(v("capacity")),unit:"Ah"}, energy:{value:Number(v("energy")),unit:"Wh"}, weight:{value:Number(v("weight")),unit:"kg"}, chemistry:v("chemistry"), cellConfiguration:v("configuration") },
    composition:{ cathode:v("cathode"), recycledLithium:{value:Number(v("recycled_lithium")),unit:"%"} },
    safety:{ operatingTemperature:v("temperature"), un38TestReference:v("un_test") },
    repair:{ dismantlingInstructions:v("dismantling"), sparePartReference:v("spare_parts") },
    documentation:{ economicOperator:v("operator"), declarationNumber:v("declaration") }
  }};
}
