import Layout from "./(components)/Layout";
import "./globals.css";

export const metadata = {
  title: "text.dev.br",
  description: "Comunidade de desenvolvedores do Brasil",
};

import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <Layout>{children}</Layout>
    </html>
  );
}
