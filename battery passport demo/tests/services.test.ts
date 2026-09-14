import test from "node:test";
import assert from "node:assert/strict";
import { demoDocuments } from "../src/lib/demo-data";
import { buildDataset, DemoBatteryDataExtractor, LocalDppProvider, MockEuRegistryProvider } from "../src/lib/services";

test("демо-экстрактор сохраняет пропуски и конфликт", async()=>{
 const fields=await new DemoBatteryDataExtractor().extract(demoDocuments);
 assert.equal(fields.length,23);assert.equal(fields.filter(f=>f.status==="MISSING").length,4);assert.equal(fields.filter(f=>f.status==="CONFLICT").length,1);
});
test("создаются 10 уникальных паспортов и регистраций",async()=>{
 let fields=await new DemoBatteryDataExtractor().extract(demoDocuments);const extra=await new DemoBatteryDataExtractor().extractSupplierResponse();
 fields=fields.map(f=>({...f,value:extra[f.id]??(f.id==="weight"?"3.6":f.value),status:"APPROVED"}));
 const dataset=buildDataset(fields);const passports=await new LocalDppProvider().createPassports(dataset,10);const records=await new MockEuRegistryProvider().register(passports);
 assert.equal(new Set(passports.map(p=>p.serialNumber)).size,10);assert.equal(new Set(records.map(r=>r.registrationId)).size,10);assert.equal(passports[0].publicPassportUrl,"/passport/PC4815-2027-000001");
});
