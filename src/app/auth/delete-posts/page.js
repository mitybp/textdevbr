"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase";
import { collection, deleteDoc, getDocs, query, where, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DeletePosts() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        toast.error("Você precisa fazer login para deletar suas postagens!");
        router.push("/auth/login/?redirect=/auth/delete-posts");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleDeletePosts = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    setLoading(true);

    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("author", "==", user.uid),
        where("type", "==", "post")
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsLength = postsSnapshot.docs.length;

      if (postsLength > 0) {
        // Deletar postagens e seus comentários
        await Promise.all(
          postsSnapshot.docs.map(async (post) => {
            // Deletar os comentários relacionados
            const replies = post.data().replies || [];
            const deleteReplies = replies.map(async (replyId) => {
              const replyRef = doc(db, "posts", replyId);
              await deleteDoc(replyRef);
            });

            // Deletar a postagem
            await deleteDoc(post.ref);
            await Promise.all(deleteReplies);
          })
        );
        toast.success(`${postsLength} postagens e seus comentários deletados com sucesso!`);
      } else {
        toast.error("Nenhuma postagem encontrada para deletar.");
      }

      router.push(redirect);
    } catch (error) {
      console.error("Erro ao deletar postagens:", error);
      toast.error("Erro ao deletar postagens!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form">
      <h1>Deletar postagens</h1>
      <div className="buttons">
        <Link href={redirect} className="btn active">
          Cancelar
        </Link>
        <button
          onClick={handleDeletePosts}
          className="danger"
          disabled={loading}
        >
          {loading ? "Processando..." : "Deletar postagens"}
        </button>
      </div>
    </section>
  );
}
