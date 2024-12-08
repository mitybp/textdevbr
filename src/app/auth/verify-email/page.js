"use client";
import { useState } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";

import Link from "next/link";

export default function VerifyEmailComponent() {
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleSendVerificationEmail = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        toast.success("E-mail de verificação enviado com sucesso!");
      } else {
        toast.error("Nenhum usuário autenticado.");
      }
    } catch (error) {
      toast.error("Erro ao enviar o e-mail de verificação.");
      console.error("Erro ao enviar o e-mail de verificação:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form">
      <h1>Verificar E-mail</h1>
      <p>
        Um e-mail de verificação será enviado para o seu endereço de e-mail. 
        Por favor, verifique sua caixa de entrada e siga as instruções para 
        confirmar seu e-mail.
      </p>
      <div className="buttons">
        <Link href="/profile" className="btn">
          Cancelar
        </Link>
        <button
          className="btn active"
          onClick={handleSendVerificationEmail}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar e-mail de verificação"}
        </button>
      </div>
    </section>
  );
}
