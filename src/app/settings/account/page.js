"use client";

import { useEffect } from "react";

import Link from "next/link";
import { Gear, PencilSimple } from "@phosphor-icons/react";

export default function ProfileSettings() {
  useEffect(()=>{
    document.title = "Configurações - text.dev.br";
  })
  return (
    <>
    <section className="tabs top">
      <a href="/settings/profile" className="btn icon-label">
        <PencilSimple />
        Editar perfil
      </a>
      <a href="/settings/account" className="btn icon-label active">
        <Gear />
        Configurações da conta
      </a>
    </section>
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
