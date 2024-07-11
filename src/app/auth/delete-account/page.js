"use client";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { deleteUser } from "firebase/auth";
import toast from "react-hot-toast";
import { deleteDoc, doc } from "firebase/firestore";

export default function DeleteAccount() {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (auth.currentUser) {
      try {
        let user = auth.currentUser;
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        toast.success("Usuário deletado com sucesso!");
        router.push("/");
      } catch (error) {
        toast.error("Erro ao deletar conta! Tente fazer login novamente.");
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
      <div className="buttons">
        <a href="/" className="btn active">
          Cancelar
        </a>
        <button onClick={handleDeleteAccount}>Deletar conta</button>
      </div>
    </section>
  );
}
