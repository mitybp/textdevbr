"use client";

import { auth, db } from "@/firebase";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import Link from "next/link";

export default function DeletePosts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        toast.error("Você precisa fazer login para deletar suas postagens!");
        router.push("/auth/login");
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
      // Consultar todas as postagens do usuário logado
      const postsQuery = query(
        collection(db, "posts"),
        where("author", "==", user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsLength = postsSnapshot.docs.length;

      if (postsLength > 0) {
        // Deletar todas as postagens encontradas
        await Promise.all(
          postsSnapshot.docs.map((post) => deleteDoc(post.ref))
        );
        toast.success(`${postsLength} postagens deletadas com sucesso!`);
      } else {
        toast.error("Nenhuma postagem encontrada para deletar.");
      }

      router.push(searchParams.get("redirect") || "/");
    } catch (error) {
      console.error("Erro ao deletar postagens:", error);
      toast.error("Erro ao deletar postagens!");
    } finally {
      setLoading(false);
    }
  };

  const DeletePostsForm = () => (
    <section className="form">
      <h1>Deletar postagens</h1>
      <div className="buttons">
        <Link href={searchParams.get("redirect") || "/"} className="btn active">
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

  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <DeletePostsForm />
    </Suspense>
  );
}
