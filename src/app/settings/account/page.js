"use client";

import { useEffect } from "react";

import Link from "next/link";

export default function ProfileSettings() {
  useEffect(()=>{
    document.title = "Configurações - text.dev.br";
  })
  return (
    <>
      <h1>Configurações</h1>
      <section className="form">
        <div>
          <Link href="/auth/reset-password" className="btn icon-label">
            Redefinir senha
          </Link>
          <Link href="/auth/recover-email" className="btn icon-label">
            Recuperar e-mail
          </Link>
          <hr/>
          <Link href="/auth/delete-posts" className="btn icon-label danger active">
            Deletar postagens
          </Link>
          <hr/>
          <Link href="/auth/delete-account" className="btn icon-label danger active">
            Deletar conta
          </Link>
        </div>
      </section>
    </>
  );
}
