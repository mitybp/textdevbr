"use client";

import { useEffect } from "react";

export default function ProfileSettings() {
  useEffect(()=>{
    document.title = "Configurações - text.dev.br";
  })
  return (
    <>
      <h1>Configurações</h1>
      <section className="form">
        <div>
          <a href="/auth/reset-password" className="btn icon-label">
            Redefinir senha
          </a>
          <a href="/auth/recover-email" className="btn icon-label">
            Recuperar e-mail
          </a>
          <hr/>
          <a href="/auth/delete-posts" className="btn icon-label danger active">
            Deletar postagens
          </a>
          <hr/>
          <a href="/auth/delete-account" className="btn icon-label danger active">
            Deletar conta
          </a>
        </div>
      </section>
    </>
  );
}
