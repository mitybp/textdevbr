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
          <hr/>
          <Link href="/auth/delete-posts" className="btn icon-label danger">
            Deletar postagens
          </Link>
          <Link href="/auth/delete-replies" className="btn icon-label danger">
            Deletar comentários
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
