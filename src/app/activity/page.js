"use client";

import PostCard from "@/(components)/PostCard";
import { auth, db } from "@/firebase";
import { BookmarksSimple, Heart, HouseSimple } from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReplyCard from "@/(components)/ReplyCard";

export default function Activity({ searchParams }) {
  const router = useRouter();
  const initialTab = searchParams?.tab || "liked";
  const [tab, setTab] = useState(initialTab);

  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());

  const [likedPostIdsSet, setLikedPostIdsSet] = useState(new Set());
  const [savedPostIdsSet, setSavedPostIdsSet] = useState(new Set());

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("newActivity", false);
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
          uid: authorData.uid,
          username: authorData.username,
        },
      };
    });

    const fetchedPosts = await Promise.all(fetchedPostsPromises);
    return fetchedPosts.filter((post) => post !== null);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    router.replace(`/activity/?tab=${newTab}`);
  };

  const handleLikePost = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Você precisa estar logado para curtir postagens!");
        return;
      }
  
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const postDocRef = doc(db, "posts", postId);
  
      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado!");
        return;
      }
  
      const userData = userDoc.data();
      const likedPosts = new Set(userData.likedPosts || []);
  
      if (likedPosts.has(postId)) {
        likedPosts.delete(postId);
        await updateDoc(postDocRef, {
          likes: increment(-1),
        });
        toast.error("Curtida removida!");
      } else {
        likedPosts.add(postId);
        await updateDoc(postDocRef, {
          likes: increment(1),
        });
        localStorage.setItem("newActivity", true);
        toast.success("Postagem curtida!");
      }
  
      // Atualiza o Firestore
      await updateDoc(userDocRef, { likedPosts: Array.from(likedPosts) });
  
      // Atualiza o estado local
      setLikedPosts(likedPosts);
    } catch (error) {
      console.error("Erro ao curtir postagem:", error);
      toast.error("Erro ao curtir postagem!");
    }
  };
  

  const handleSavePost = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Você precisa estar logado para salvar postagens!");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado!");
        return;
      }

      const userData = userDoc.data();
      const savedPosts = new Set(userData.savedPosts || []);

      if (savedPosts.has(postId)) {
        savedPosts.delete(postId);
        toast.error("Postagem removida dos salvos!");
      } else {
        savedPosts.add(postId);
        localStorage.setItem("newActivity", true);
        toast.success("Postagem salva!");
      }

      // Atualiza o Firestore
      await updateDoc(userDocRef, { savedPosts: Array.from(savedPosts) });

      // Atualiza o estado local
      setSavedPosts(savedPosts);
    } catch (error) {
      console.error("Erro ao salvar postagem:", error);
      toast.error("Erro ao salvar postagem!");
    }
  };
  

  const renderPosts = (postsSet) => {
    const postsArray = Array.from(postsSet);
    return postsArray.length === 0 ? (
      <section className="explore">
        <p>Nenhuma postagem {tab === "liked" ? "curtida" : "salva"} ainda!</p>
        <Link href="/" className="btn active icon-label">
          <HouseSimple />
          Explorar postagens na página inicial
        </Link>
      </section>
    ) : (
      postsArray.map((post) =>
        post.type == "post" ? (
          <PostCard
            key={post.id}
            post={post}
            author={post.author}
            likedPosts={likedPostIdsSet}
            savedPosts={savedPostIdsSet}
            handleLikePost={handleLikePost}
            handleSavePost={handleSavePost}
            isProfile={false}
          />
        ) : (
          <ReplyCard
            key={post.id}
            reply={post}
            inList={true}
            likedPosts={likedPostIdsSet}
            savedPosts={savedPostIdsSet}
            handleLikePost={handleLikePost}
            handleSavePost={handleSavePost}
          />
        )
      )
    );
  };

  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <h1>Atividade</h1>
      <section className="tabs">
        <button
          className={`icon-label ${tab === "liked" ? "active" : ""}`}
          onClick={() => handleTabChange("liked")}
        >
          <Heart weight={tab === "liked" ? "fill" : "regular"} /> Curtidos{" "}
          <small className="gray">{likedPostIdsSet.size}</small>
        </button>
        <button
          className={`icon-label ${tab === "saved" ? "active" : ""}`}
          onClick={() => handleTabChange("saved")}
        >
          <BookmarksSimple weight={tab === "saved" ? "fill" : "regular"} />{" "}
          Salvos <small className="gray">{savedPostIdsSet.size}</small>
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
    </Suspense>
  );
}
