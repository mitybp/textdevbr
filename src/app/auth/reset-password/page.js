"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email enviado com sucesso!");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erro ao enviar email!");
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
      </div>
      <div className="buttons">
        <a href="/auth/login" className="btn">
          Cancelar
        </a>
        <button className="active" onClick={handleResetPassword}>
          Enviar link
        </button>
      </div>
    </section>
  );
}
