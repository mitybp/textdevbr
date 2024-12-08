"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DeleteReplies() {
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
        router.push("/auth/login/?redirect=/auth/delete-replies");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleDeleteReplies = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    setLoading(true);

    try {
      const repliesQuery = query(
        collection(db, "posts"),
        where("author", "==", user.uid),
        where("type", "==", "reply")
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      const repliesLength = repliesSnapshot.docs.length;

      if (repliesLength > 0) {
        await Promise.all(
          repliesSnapshot.docs.map(async (replyDoc) => {
            const replyData = replyDoc.data();
            const parentId = replyData.parent[1]; // ID do post pai

            // 1. Atualizar a postagem pai removendo o ID do comentário
            const postRef = doc(db, "posts", parentId);
            const postSnapshot = await getDoc(postRef);

            if (postSnapshot.exists()) {
              const postData = postSnapshot.data();
              const updatedReplies = postData.replies.filter(
                (replyId) => replyId !== replyDoc.id
              );

              // Atualizar a postagem com a lista de replies modificada
              await updateDoc(postRef, {
                replies: updatedReplies,
              });
            }

            // 2. Deletar o comentário
            await deleteDoc(replyDoc.ref);
          })
        );
        toast.success(`${repliesLength} comentários deletados com sucesso!`);
      } else {
        toast.error("Nenhum comentário encontrado para deletar.");
      }

      router.push(redirect);
    } catch (error) {
      console.error("Erro ao deletar comentários:", error);
      toast.error("Erro ao deletar comentários!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form">
      <h1>Deletar comentários</h1>
      <div className="buttons">
        <Link href={redirect} className="btn active">
          Cancelar
        </Link>
        <button
          onClick={handleDeleteReplies}
          className="danger"
          disabled={loading}
        >
          {loading ? "Processando..." : "Deletar comentários"}
        </button>
      </div>
    </section>
  );
}
