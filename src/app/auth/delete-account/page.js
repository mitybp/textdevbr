"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { deleteUser, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { deleteDoc, doc } from "firebase/firestore";

import Link from "next/link";

export default function DeleteAccount() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        let user = auth.currentUser;

        // Excluir os dados do Firestore
        await deleteDoc(doc(db, "users", user.uid));

        // Excluir o usuário do Firebase Authentication
        await deleteUser(user);

        toast.success("Usuário deletado com sucesso!");

        // Deslogar o usuário após a deleção
        await signOut(auth);

        router.push("/");
      } catch (error) {
        // Autenticação recente pode ser necessária
        if (error.code === "auth/requires-recent-login") {
          toast.error("Autenticação recente necessária. Por favor, faça login novamente.");
          router.push("/auth/login");
        } else {
          toast.error("Erro ao deletar conta! Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Você precisa fazer login para deletar sua conta!");
      router.push("/auth/login");
    }
  };

  return (
    <section className="form">
      <h1>Deletar conta</h1>
      <p>
        É uma pena que você esteja nos deixando, sentimos muito por não poder
        atender o que você desejava.
      </p>
      <p>
        Caso queira deixar sua opinião, envie-nos um e-mail:{" "}
        <Link href="mailto:contato@text.dev.br" type="mail">contato@text.dev.br</Link>
      </p>
      <div className="buttons">
        <Link href="/" className="btn active">
          Cancelar
        </Link>
        <button onClick={handleDeleteAccount} disabled={loading}>
          {loading ? "Deletando..." : "Deletar conta"}
        </button>
      </div>
    </section>
  );
}
