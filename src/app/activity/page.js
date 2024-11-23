"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import PostCard from "@/(components)/PostCard";
import { auth, db } from "@/firebase";
import { Heart, BookmarksSimple } from "@phosphor-icons/react";
import Link from "next/link";

const ActivityContent = ({ initialTab }) => {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab || "liked");

  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());

  const [likedPostIdsSet, setLikedPostIdsSet] = useState(new Set());
  const [savedPostIdsSet, setSavedPostIdsSet] = useState(new Set());

  const [loading, setLoading] = useState(false);

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
      const likedPostIds = userData.likedPosts || [];
      const savedPostIds = userData.savedPosts || [];

      const fetchedLikedPosts = await fetchPostsWithAuthors(likedPostIds);
      const fetchedSavedPosts = await fetchPostsWithAuthors(savedPostIds);

      setLikedPostIdsSet(new Set(likedPostIds));
      setSavedPostIdsSet(new Set(savedPostIds));

      setLikedPosts(new Set(fetchedLikedPosts));
      setSavedPosts(new Set(fetchedSavedPosts));
    } catch (error) {
      toast.error("Erro ao buscar atividades do usuário");
      console.error("Erro ao buscar atividades:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsWithAuthors = async (postIds) => {
    const fetchedPostsPromises = postIds.map(async (postId) => {
      const postDoc = await getDoc(doc(db, "posts", postId));
      if (!postDoc.exists()) return null;

      const postData = postDoc.data();

      if (!postData.author) {
        return { ...postData, author: { username: "Anônimo", uid: null } };
      }

      const authorDoc = await getDoc(doc(db, "users", postData.author));
      if (!authorDoc.exists()) {
        return { ...postData, author: { username: "Anônimo", uid: null } };
      }

      const authorData = authorDoc.data();
      return {
        ...postData,
        author: {
          username: authorData.username || "Anônimo",
          uid: authorData.uid,
        },
      };
    });

    const fetchedPosts = await Promise.all(fetchedPostsPromises);
    return fetchedPosts.filter((post) => post !== null);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    router.push(`/activity/?tab=${newTab}`);
  };

  const renderPosts = (postsSet) => {
    const postsArray = Array.from(postsSet);
    return postsArray.length === 0 ? (
      <section className="explore">
        <p>Nenhuma postagem {tab === "liked" ? "curtida" : "salva"} ainda!</p>
        <Link href="/" className="btn active icon-label">
          Explorar
        </Link>
      </section>
    ) : (
      postsArray.map((post) => (
        <PostCard key={post.id} post={post} />
      ))
    );
  };

  return (
    <>
      <section className="tabs">
        <button
          className={`icon-label ${tab === "liked" ? "active" : ""}`}
          onClick={() => handleTabChange("liked")}
        >
          <Heart weight={tab === "liked" ? "fill" : "regular"} /> Curtidos (
          {likedPostIdsSet.size})
        </button>
        <button
          className={`icon-label ${tab === "saved" ? "active" : ""}`}
          onClick={() => handleTabChange("saved")}
        >
          <BookmarksSimple weight={tab === "saved" ? "fill" : "regular"} />{" "}
          Salvos ({savedPostIdsSet.size})
        </button>
      </section>

      <section className="posts">
        {loading ? <p>Carregando...</p> : tab === "liked" ? renderPosts(likedPosts) : renderPosts(savedPosts)}
      </section>
    </>
  );
};

const Activity = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  return (
    <Suspense fallback={<p>Carregando atividade...</p>}>
      <ActivityContent initialTab={initialTab} />
    </Suspense>
  );
};

export default Activity;
