"use client";

import { auth, db } from "@/firebase";
import {
  Users,
  Compass,
  MagnifyingGlass,
  X,
  ArrowDown,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  endAt,
} from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PostCard from "./(components)/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [following, setFollowing] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState("explore");

  const observerRef = useRef();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "explore";
  const currentSearch = searchParams.get("q") || "";

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) fetchUserData(user);
    });
  }, []);

  useEffect(() => {
    setSearchTerm(currentSearch);
    setPosts([]);
    setHasMore(true);
    if (tab === "following" || currentTab === "following") {
      fetchFollowingPosts(currentSearch);
    } else {
      fetchPosts(currentSearch);
    }
  }, [tab, currentSearch]);

  useEffect(() => {
    if (!loading && hasMore) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (tab === "following" || currentTab === "following") {
              fetchFollowingPosts(currentSearch);
            } else {
              fetchPosts(currentSearch);
            }
          }
        },
        { threshold: 1.0 }
      );
      if (observerRef.current) observer.observe(observerRef.current);
      return () => observer.disconnect();
    }
  }, [loading, hasMore, tab, currentSearch]);

  const fetchUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSavedPosts(new Set(userData.savedPosts || []));
        setLikedPosts(new Set(userData.likedPosts || []));
        setFollowing(userData.following || []);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
    }
  };

  const fetchPosts = async (search = "") => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      let q;
      if (search) {
        q = query(
          collection(db, "posts"),
          orderBy("titleLowerCase"),
          startAt(search.toLowerCase()),
          endAt(search.toLowerCase() + "\uf8ff"),
          limit(10),
          where("isDraft", "==", false)
        );
      } else {
        q = query(
          collection(db, "posts"),
          where("isDraft", "==", false),
          limit(10)
        );
      }
  
      const lastPost = posts[posts.length - 1];
      if (lastPost) {
        q = query(q, startAfter(lastPost.date)); // Usa o campo 'date' para paginação
      }
  
      const querySnapshot = await getDocs(q);
      const fetchedPosts = await mapPosts(querySnapshot);
  
      // Filtra para evitar duplicados
      const uniquePosts = fetchedPosts.filter(
        (post) => !posts.some((existing) => existing.id === post.id)
      );
  
      if (uniquePosts.length === 0) setHasMore(false);
      setPosts((prev) => [...prev, ...uniquePosts]);
    } catch (error) {
      toast.error("Erro ao buscar postagens");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFollowingPosts = async (search = "") => {
    if (loading || !hasMore || following.length === 0) return;
    setLoading(true);
    try {
      let q;
      if (search) {
        q = query(
          collection(db, "posts"),
          where("author", "in", following),
          orderBy("titleLowerCase"),
          startAt(search.toLowerCase()),
          endAt(search.toLowerCase() + "\uf8ff"),
          limit(10),
          where("isDraft", "==", false)
        );
      } else {
        q = query(
          collection(db, "posts"),
          where("author", "in", following),
          where("isDraft", "==", false),
          limit(10)
        );
      }
  
      const lastPost = posts[posts.length - 1];
      if (lastPost) {
        q = query(q, startAfter(lastPost.date)); // Usa o campo 'date' para paginação
      }
  
      const querySnapshot = await getDocs(q);
      const fetchedPosts = await mapPosts(querySnapshot);
  
      // Filtra para evitar duplicados
      const uniquePosts = fetchedPosts.filter(
        (post) => !posts.some((existing) => existing.id === post.id)
      );
  
      if (uniquePosts.length === 0) setHasMore(false);
      setPosts((prev) => [...prev, ...uniquePosts]);
    } catch (error) {
      toast.error("Erro ao buscar postagens dos seguidos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const mapPosts = async (querySnapshot) => {
    const tempPosts = [];
    const authorCache = {};

    for (const post of querySnapshot.docs) {
      const postData = post.data();
      if (!authorCache[postData.author]) {
        authorCache[postData.author] = await fetchAuthorData(postData.author);
      }
      tempPosts.push({ ...postData, author: authorCache[postData.author] });
    }
    return tempPosts;
  };

  const fetchAuthorData = async (authorUid) => {
    try {
      const authorDoc = await getDoc(doc(db, "users", authorUid));
      if (authorDoc.exists()) {
        const authorData = authorDoc.data();
        return {
          username: authorData.username || "Desconhecido",
          uid: authorData.uid,
          photoURL:
            authorData.photoURL ||
            `https://eu.ui-avatars.com/api/?name=${authorData.username.replaceAll(" ", "+")}&size=250`,
        };
      }
      return {};
    } catch (error) {
      console.error(error);
      toast.error("Erro ao receber dados do autor!");
      return {};
    }
  };

  const handleSearch = () => {
    const newUrl = `/?tab=${currentTab}&q=${searchTerm}`;
    router.push(newUrl);
  };

  return (
    <>
      {auth.currentUser && (
        <section className="tabs top">
          <button
            className={`icon-label ${tab === "explore" && "active"}`}
            onClick={() => {
              setTab("explore");
              router.push("/?tab=explore");
            }}
          >
            <Compass /> Explorar
          </button>
          <button
            className={`icon-label ${tab === "following" && "active"}`}
            onClick={() => {
              setTab("following");
              router.push("/?tab=following");
            }}
          >
            <Users /> Seguidos
          </button>
        </section>
      )}
      <section className="search">
        <div className="input_x">
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="icon">
            <X />
          </button>
        </div>
        <button onClick={handleSearch} className="icon active">
          <MagnifyingGlass />
        </button>
      </section>

      <div className="posts-list">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            author={post.author}
            post={post}
            likedPosts={likedPosts}
            savedPosts={savedPosts}
          />
        ))}
      </div>

      <div ref={observerRef} className="loading-indicator">
        {loading && <div>Carregando...</div>}
      </div>
    </>
  );
}
