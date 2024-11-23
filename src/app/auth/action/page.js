"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  signOut,
  getAuth,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";
import { Eye, EyeClosed } from "@phosphor-icons/react";
import Link from "next/link";

export default function AuthAction() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const auth = getAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pw1Visible, setPw1Visible] = useState(false);
  const [pw2Visible, setPw2Visible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!oobCode) {
      toast.error("Código inválido ou expirado!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Senha redefinida com sucesso!");
      signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erro ao redefinir a senha!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverEmail = async () => {
    if (!oobCode) {
      toast.error("Código inválido ou expirado!");
      return;
    }

    try {
      await applyActionCode(auth, oobCode);
      toast.success("Email recuperado com sucesso!");
      signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erro ao recuperar o email!");
      console.error(error);
    }
  };

  const handleVerifyEmail = async () => {
    if (!oobCode) {
      toast.error("Código inválido ou expirado!");
      return;
    }

    try {
      await applyActionCode(auth, oobCode);

      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          emailVerified: true,
        });
      }

      toast.success("Email verificado com sucesso!");
      signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erro ao verificar o email!");
      console.error(error);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case "resetPassword":
        return (
          <section className="form">
            <h1>Redefinir Senha</h1>
            <div>
              <div className="input">
                <input
                  type={pw1Visible ? "text" : "password"}
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button onClick={() => setPw1Visible(!pw1Visible)} disabled={loading}>
                  {pw1Visible ? <EyeClosed /> : <Eye />}
                </button>
              </div>
              <div className="input">
                <input
                  type={pw2Visible ? "text" : "password"}
                  placeholder="Confirme a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button onClick={() => setPw2Visible(!pw2Visible)} disabled={loading}>
                  {pw2Visible ? <EyeClosed /> : <Eye />}
                </button>
              </div>
            </div>
            <div className="buttons">
              <Link href="/auth/login" className="btn">
                Cancelar
              </Link>
              <button onClick={handleResetPassword} disabled={loading}>
                Redefinir Senha
              </button>
            </div>
          </section>
        );

      case "recoverEmail":
        return (
          <section className="form">
            <h1>Recuperar Email</h1>
            <div className="buttons">
              <Link href="/auth/login" className="btn">
                Cancelar
              </Link>
              <button onClick={handleRecoverEmail} disabled={loading}>
                Recuperar Email
              </button>
            </div>
          </section>
        );

      case "verifyEmail":
        return (
          <section className="form">
            <h1>Verificar Email</h1>
            <div className="buttons">
              <Link href="/auth/login" className="btn">
                Cancelar
              </Link>
              <button onClick={handleVerifyEmail} disabled={loading}>
                Verificar Email
              </button>
            </div>
          </section>
        );

      default:
        return <p>Modo inválido.</p>;
    }
  };

  return <>{renderForm()}</>;
}
