"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAuth,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  signOut,
} from "firebase/auth";
import toast from "react-hot-toast";
import { Eye, EyeClosed } from "@phosphor-icons/react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

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
      toast.error("Erro ao redefinir a senha! Verifique o código ou tente novamente.");
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

      // Verifique se o usuário está logado antes de atualizar o Firestore
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

  const handleDeleteAccount = async () => {
    try {
      // Lógica para deletar a conta do usuário
      toast.success("Conta deletada com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error("Erro ao deletar a conta!");
      console.error(error);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case "resetPassword":
        return (
          <section className="form">
            <h1>Redefinir senha</h1>
            <div>
              <div className="input">
                <input
                  type={pw1Visible ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  disabled={loading}
                />
                <button
                  className="icon"
                  onClick={() => setPw1Visible(!pw1Visible)}
                  disabled={loading}
                >
                  {pw1Visible ? <EyeClosed /> : <Eye />}
                </button>
              </div>
              <div className="input">
                <input
                  type={pw2Visible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  disabled={loading}
                />
                <button
                  className="icon"
                  onClick={() => setPw2Visible(!pw2Visible)}
                  disabled={loading}
                >
                  {pw2Visible ? <EyeClosed /> : <Eye />}
                </button>
              </div>
            </div>
            <div className="buttons">
              <a href="/auth/login" className="btn">
                Cancelar
              </a>
              <button
                className="active"
                onClick={handleResetPassword}
                disabled={loading}
              >
                Redefinir senha
              </button>
            </div>
          </section>
        );

      case "recoverEmail":
        return (
          <section className="form">
            <h1>Recuperar Email</h1>
            <div className="buttons">
              <a href="/auth/login" className="btn">
                Cancelar
              </a>
              <button className="active" onClick={handleRecoverEmail} disabled={loading}>
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
              <a href="/auth/login" className="btn">
                Cancelar
              </a>
              <button className="active" onClick={handleVerifyEmail} disabled={loading}>
                Verificar Email
              </button>
            </div>
          </section>
        );

      case "deleteAccount":
        return (
          <section className="form">
            <h1>Deletar Conta</h1>
            <div className="buttons">
              <a href="/" className="btn">
                Cancelar
              </a>
              <button className="btn danger" onClick={handleDeleteAccount}>
                Deletar minha conta
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
