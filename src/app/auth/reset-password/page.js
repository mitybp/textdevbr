"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";

import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Por favor, insira seu e-mail.");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("E-mail inválido.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email enviado com sucesso!");
      router.push("/auth/login");
    } catch (error) {
      let errorMessage = "Erro ao enviar email!";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado.";
      }
      toast.error(errorMessage);
      console.error("Erro ao enviar email:", error);
    }
  };

  return (
    <section className="form">
      <h1>Redefinir senha</h1>
      <div>
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Link href="/auth/recover-email">Esqueceu o e-mail?</Link>
      </div>
      <div className="buttons">
        <Link href="/auth/login" className="btn">
          Cancelar
        </Link>
        <button className="active" onClick={handleResetPassword}>
          Enviar link
        </button>
      </div>
    </section>
  );
}
