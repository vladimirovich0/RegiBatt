import { CanonicalBatteryField, RawDocument } from "./types";

export const demoDocuments: RawDocument[] = [
  { id: "d1", name: "battery_datasheet.pdf", type: "PDF", size: "1 стр.", url: "/demo-documents/battery_datasheet.pdf" },
  { id: "d2", name: "un38_3_test_report.pdf", type: "PDF", size: "1 стр.", url: "/demo-documents/un38_3_test_report.pdf" },
  { id: "d3", name: "battery_specifications.xlsx", type: "XLSX", size: "4 строки", url: "/demo-documents/battery_specifications.xlsx" },
  { id: "d4", name: "supplier_information.csv", type: "CSV", size: "6 строк", url: "/demo-documents/supplier_information.csv" },
  { id: "d5", name: "declaration_of_conformity.pdf", type: "PDF", size: "1 стр.", url: "/demo-documents/declaration_of_conformity.pdf" },
];

type Seed = [string,string,string,string|null,string?,string?,number?,string?];
const seeds: Seed[] = [
  ["model","Модель батареи","Identity","PC-4815","","battery_datasheet.pdf",99,"Battery model: PC-4815"],
  ["category","Категория батареи","Identity","LMT","","battery_datasheet.pdf",94,"Battery category: LMT"],
  ["product_name","Коммерческое наименование","Identity","PowerCell Urban 48","","battery_datasheet.pdf",91,"Product name: PowerCell Urban 48"],
  ["manufacturer","Производитель","Manufacturer","Shenzhen PowerCell Technology Co., Ltd.","","un38_3_test_report.pdf",99,"Manufacturer: Shenzhen PowerCell Technology Co., Ltd."],
  ["country","Страна производства","Manufacturer","China","","un38_3_test_report.pdf",98,"Manufacturing location: Shenzhen, China"],
  ["city","Город производства","Manufacturer","Shenzhen","","supplier_information.csv",99,"manufacturing_city,Shenzhen"],
  ["address","Адрес производителя","Manufacturer","88 Longhua Technology Road","","supplier_information.csv",97,"manufacturer_address,88 Longhua Technology Road"],
  ["voltage","Номинальное напряжение","Battery characteristics","48","V","battery_datasheet.pdf",99,"Nominal voltage: 48 V"],
  ["capacity","Номинальная ёмкость","Battery characteristics","15","Ah","battery_datasheet.pdf",99,"Rated capacity: 15 Ah"],
  ["energy","Номинальная энергия","Battery characteristics","720","Wh","battery_datasheet.pdf",99,"Nominal energy: 720 Wh"],
  ["weight","Масса","Battery characteristics","3.6 / 3.55","kg","battery_datasheet.pdf + battery_specifications.xlsx",100,"Battery weight: 3.6 kg / 3.55 kg"],
  ["chemistry","Химический состав","Composition","NMC","","battery_specifications.xlsx",96,"Chemistry | NMC"],
  ["configuration","Конфигурация ячеек","Composition","13S5P","","battery_specifications.xlsx",94,"Cell configuration | 13S5P"],
  ["cathode","Состав катода","Composition",null],
  ["recycled_lithium","Доля переработанного лития","Sustainability",null,"%"],
  ["temperature","Рабочая температура","Safety","-20…+60","°C","battery_specifications.xlsx",96,"Operating temperature | -20 to +60 | °C"],
  ["un_test","Номер испытания UN 38.3","Safety","UN38-PC4815-2026-118","","un38_3_test_report.pdf",98,"Test reference: UN38-PC4815-2026-118"],
  ["dismantling","Инструкции по демонтажу","Dismantling / repair",null],
  ["spare_parts","Информация о запасных частях","Dismantling / repair",null],
  ["operator","Экономический оператор","Documentation","VoltRide Sp. z o.o.","","declaration_of_conformity.pdf",99,"Economic operator: VoltRide Sp. z o.o."],
  ["declaration","Номер декларации","Documentation","VR-DOC-2027-041","","declaration_of_conformity.pdf",98,"Declaration number: VR-DOC-2027-041"],
  ["supplier_email","Email поставщика","Documentation","compliance@powercell-demo.cn","","supplier_information.csv",99,"supplier_email,compliance@powercell-demo.cn"],
  ["market","Целевой рынок","Documentation","Польша, Германия","","declaration_of_conformity.pdf",92,"Market: Poland and Germany"],
];

export function initialFields(): CanonicalBatteryField[] {
  return seeds.map(([id,name,category,value,unit,source,confidence,fragment]) => ({
    id, name_ru: name, name_en: id, category, required: true, value, unit,
    status: id === "weight" ? "CONFLICT" : value === null ? "MISSING" : "FOUND",
    sourceDocument: source, sourcePage: source?.endsWith(".pdf") ? 1 : undefined,
    confidence, approved: false, visibility: ["supplier_email","address"].includes(id) ? "RESTRICTED" : "PUBLIC", fragment,
    candidates: id === "weight" ? [
      { value:"3.6", unit:"kg", sourceDocument:"battery_datasheet.pdf", sourcePage:1, fragment:"Battery weight: 3.6 kg", confidence:99 },
      { value:"3.55", unit:"kg", sourceDocument:"battery_specifications.xlsx", fragment:"Battery weight | 3.55 | kg", confidence:98 }
    ] : undefined
  }));
}
