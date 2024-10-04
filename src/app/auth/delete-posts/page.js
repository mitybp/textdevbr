"use client";
import { auth, db } from "@/firebase";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeletePosts() {
  const router = useRouter();

  const handleDeletePosts = async () => {
    if (auth.currentUser) {
      try {
        // Consultar todas as postagens do usuário logado
        let postsQuery = query(
          collection(db, "posts"),
          where("author", "==", auth.currentUser.uid)
        );
        let postsSnapshot = await getDocs(postsQuery);
        let postsLength = postsSnapshot.docs.length;

        if (postsLength > 0) {
          // Deletar todas as postagens encontradas
          await Promise.all(
            postsSnapshot.docs.map((post) => deleteDoc(post.ref))
          );
          toast.success(`${postsLength} postagens deletadas com sucesso!`);
        } else {
          toast.error("Nenhuma postagem encontrada para deletar.");
        }

        router.push("/profile");
      } catch (error) {
        toast.error("Erro ao deletar postagens!");
      }
    } else {
      toast.error("Você precisa fazer login para deletar suas postagens!");
      router.push("/auth/login");
    }
  };

  return (
    <section className="form">
      <h1>Deletar postagens</h1>
      <div className="buttons">
        <a href="/profile" className="btn active">
          Cancelar
        </a>
        <button onClick={handleDeletePosts}>Deletar postagens</button>
      </div>
    </section>
  );
}
