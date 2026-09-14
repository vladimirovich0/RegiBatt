import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";

const out = join(process.cwd(), "public", "demo-documents");
mkdirSync(out, { recursive: true });

async function pdf(name: string, title: string, lines: string[]) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText(title, { x: 55, y: 775, size: 18, font: bold, color: rgb(.05, .15, .28) });
  lines.forEach((line, index) => page.drawText(line, { x: 55, y: 725 - index * 28, size: 11, font }));
  page.drawText("DEMO DOCUMENT — NOT FOR REGULATORY USE", { x: 55, y: 45, size: 9, font, color: rgb(.5, .5, .5) });
  writeFileSync(join(out, name), await doc.save());
}

async function main() {
await pdf("battery_datasheet.pdf", "PowerCell PC-4815 — Product Datasheet", [
  "Battery model: PC-4815", "Battery category: LMT", "Product name: PowerCell Urban 48", "Nominal voltage: 48 V", "Rated capacity: 15 Ah", "Nominal energy: 720 Wh", "Battery weight: 3.6 kg"
]);
await pdf("un38_3_test_report.pdf", "UN 38.3 Transport Test Summary", [
  "Manufacturer: Shenzhen PowerCell Technology Co., Ltd.", "Battery model: PC-4815", "Test reference: UN38-PC4815-2026-118", "Manufacturing location: Shenzhen, China", "Result: PASS"
]);
await pdf("declaration_of_conformity.pdf", "EU Declaration of Conformity — Demo", [
  "Economic operator: VoltRide Sp. z o.o.", "Product model: PC-4815", "Declaration number: VR-DOC-2027-041", "Market: Poland and Germany"
]);

const specs = XLSX.utils.json_to_sheet([
  { Field: "Chemistry", Value: "NMC", Unit: "" },
  { Field: "Cell configuration", Value: "13S5P", Unit: "" },
  { Field: "Operating temperature", Value: "-20 to +60", Unit: "°C" },
  { Field: "Battery weight", Value: 3.55, Unit: "kg" }
]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, specs, "Specifications");
XLSX.writeFile(wb, join(out, "battery_specifications.xlsx"));

writeFileSync(join(out, "supplier_information.csv"), [
  "field,value", "manufacturer_address,88 Longhua Technology Road", "manufacturing_city,Shenzhen", "manufacturing_country,China", "contact_person,Li Wei", "supplier_email,compliance@powercell-demo.cn"
].join("\n"));

const response = XLSX.utils.json_to_sheet([
  { Field: "Cathode composition", Value: "NMC 811" },
  { Field: "Recycled lithium content", Value: "12%" },
  { Field: "Dismantling instructions", Value: "Document DI-PC4815-v2" },
  { Field: "Spare part reference", Value: "PC4815-HOUSING-01" }
]);
const responseWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(responseWb, response, "Additional data");
XLSX.writeFile(responseWb, join(out, "supplier_additional_data.xlsx"));
copyFileSync(join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs"), join(process.cwd(), "public", "pdf.worker.min.mjs"));

console.log("Demo documents generated in public/demo-documents");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
