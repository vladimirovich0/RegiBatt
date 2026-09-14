import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title:"Battery Passport Demo", description:"Демонстрация сквозного процесса цифрового паспорта батареи" };
export default function RootLayout({ children }:{ children:React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
