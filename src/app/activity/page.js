"use client";
import PostCard from "@/components/PostCard";
import { auth, db } from "@/firebase";
import { BookmarksSimple, Heart } from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, documentId, getDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Activity = () => {
  const router = useRouter();
  const [tab, setTab] = useState("liked");
  const [likedPosts, setLikedPosts] = useState([]); // Modificado para array
  const [savedPosts, setSavedPosts] = useState([]); // Modificado para array
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserActivity(user.uid);
      } else {
        toast.error("Você precisa estar logado para ver as postagens salvas!");
        router.push("/auth/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUserActivity = async (uid) => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado!");
        return;
      }

      const userData = userDoc.data();
      setUser(userData);

      const likedPosts = userData.likedPosts || [];
      const saved = userData.savedPosts || [];

      const [fetchedLikedPosts, fetchedSavedPosts] = await Promise.all([
        fetchPostsInBatches(likedPosts),
        fetchPostsInBatches(saved),
      ]);

      setLikedPosts(fetchedLikedPosts); // Setando arrays diretamente
      setSavedPosts(fetchedSavedPosts);
    } catch (error) {
      toast.error("Erro ao buscar atividades do usuário");
      console.error("Erro ao buscar atividades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsInBatches = async (ids) => {
    if (ids.length === 0) return []; // Verifica se o array está vazio
    const batchIds = ids.slice(0, 50); // Limita os IDs
    const postsQuery = query(
      collection(db, "posts"),
      where(documentId(), "in", batchIds)
    );
    const postsSnap = await getDocs(postsQuery);
    return postsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const renderPosts = (posts) => {
    return posts.length === 0 ? (
      <p>Nenhuma postagem {tab === "liked" ? "curtida" : "salva"} ainda!</p>
    ) : (
      posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          author={user}
          likedPosts={likedPosts}
          setLikedPosts={setLikedPosts}
          savedPosts={savedPosts}
          setSavedPosts={setSavedPosts}
          isProfile={false}
        />
      ))
    );
  };

  return (
    <>
      <h1>Atividade</h1>

      <section className="tabs">
        <button
          className={`icon-label ${tab === "liked" ? "active" : ""}`}
          onClick={() => setTab("liked")}
        >
          <Heart weight={tab === "liked" ? "fill" : "regular"} /> Curtidos
        </button>
        <button
          className={`icon-label ${tab === "saved" ? "active" : ""}`}
          onClick={() => setTab("saved")}
        >
          <BookmarksSimple weight={tab === "saved" ? "fill" : "regular"} /> Salvos
        </button>
      </section>

      <section className="posts">
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            {tab === "liked"
              ? renderPosts(likedPosts)
              : renderPosts(savedPosts)}
          </>
        )}
      </section>
    </>
  );
};

export default Activity;
