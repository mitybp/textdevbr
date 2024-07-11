"use client";
import {ArrowSquareOut} from "@phosphor-icons/react";

export default function ProfileSettings(){
  return(
    <>
      <h1>Configurações</h1>
      <section className="form">
        <div>
          <p>Redefinir senha</p>
          <a className="btn icon-label">
            Redefinir senha
            <ArrowSquareOut/>
          </a>
        </div>
        <div>
          <p>Deletar conta</p>
          <a className="btn icon-label danger">
            Deletar conta
            <ArrowSquareOut/>
          </a>
        </div>
      </section>
    </>
  )
}
