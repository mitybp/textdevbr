"use client";

import { auth, db } from "@/firebase";
import {
  Users,
  Compass,
  MagnifyingGlass,
  ArrowDown,
  X,
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
  startAt,
  where,
  endAt,
} from "firebase/firestore";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PostCard from "./(components)/PostCard";
import Link from "next/link";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [following, setFollowing] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [postsLimit] = useState(50);
  const [tab, setTab] = useState("explore");

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "explore";
  const currentSearch = searchParams.get("q") || "";
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page"))
    : 1;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) fetchUserData(user);
    });
  }, []);

  useEffect(() => {
    setSearchTerm(currentSearch);
    if (tab === "following" || currentTab === "following") {
      fetchFollowingPosts(currentPage, currentSearch);
    } else {
      fetchPosts(currentPage, currentSearch);
    }
  }, [tab, order, currentPage, currentSearch]);

  const fetchUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSavedPosts(new Set(userData.savedPosts || []));
        setLikedPosts(new Set(userData.likedPosts || []));
        setFollowing(userData.following || []);
        Cookies.set("user", JSON.stringify(userData), { expires: 7 });
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
    }
  };

  const fetchPosts = async (page = 1, search = "") => {
    setLoading(true);
    setTab("explore");
    try {
      let q;
      if (search) {
        q = query(
          collection(db, "posts"),
          orderBy("titleLowerCase"),
          startAt(search.toLowerCase()),
          endAt(search.toLowerCase() + "\uf8ff"),
          limit(postsLimit)
        );
      } else {
        q = query(
          collection(db, "posts"),
          orderBy("date", order),
          limit(postsLimit)
        );
      }

      const paginatedQuery = await getPaginatedQuery(q, page);
      const querySnapshot = await getDocs(paginatedQuery);
      const fetchedPosts = await mapPosts(querySnapshot);

      setPosts((prevPosts) => [
        ...prevPosts,
        ...fetchedPosts.filter(
          (post) => !prevPosts.some((p) => p.id === post.id)
        ),
      ]);
    } catch (error) {
      toast.error("Erro ao buscar postagens");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingPosts = async (page = 1, search = "") => {
    setLoading(true);
    setTab("following");
    try {
      if (following.length > 0) {
        let q = query(
          collection(db, "posts"),
          where("author", "in", following),
          orderBy("date", order),
          limit(postsLimit)
        );

        if (search) {
          q = query(
            collection(db, "posts"),
            where("author", "in", following),
            orderBy("titleLowerCase"),
            startAt(search.toLowerCase()),
            endAt(search.toLowerCase() + "\uf8ff"),
            limit(postsLimit)
          );
        }

        const paginatedQuery = await getPaginatedQuery(q, page);
        const querySnapshot = await getDocs(paginatedQuery);
        const fetchedPosts = await mapPosts(querySnapshot);

        setPosts((prevPosts) => [
          ...prevPosts,
          ...fetchedPosts.filter(
            (post) => !prevPosts.some((p) => p.id === post.id)
          ),
        ]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar postagens dos seguidos");
    } finally {
      setLoading(false);
    }
  };

  const getPaginatedQuery = async (q, page) => {
    if (page > 1 && posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      const lastPostDoc = await getDoc(doc(db, "posts", lastPost.id));
      return query(q, startAfter(lastPostDoc)); // Retorna a Query diretamente
    }
    return q; // Retorna a Query para a primeira página
  };

  const mapPosts = async (querySnapshot) => {
    const tempPosts = [];
    for (const post of querySnapshot.docs) {
      const postData = post.data();
      const authorData = await fetchAuthorData(postData.author);
      tempPosts.push({ ...postData, author: authorData });
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
      return {};
    }
  };

  const handleSearch = async () => {
    const newUrl = `/?tab=${currentTab}&q=${searchTerm}`;
    router.push(newUrl);
    if (searchTerm) {
      await fetchPosts(1, searchTerm);
    } else {
      await fetchPosts(1);
    }
  };

  const handleSavePostChange = (postId, isSaved) => {
    setSavedPosts((prevSavedPosts) => {
      const updatedSavedPosts = new Set(prevSavedPosts);
      if (isSaved) {
        updatedSavedPosts.add(postId);
      } else {
        updatedSavedPosts.delete(postId);
      }
      return updatedSavedPosts;
    });
  };

  // Função para atualizar posts curtidos
  const handleLikePostChange = (postId, isLiked) => {
    setLikedPosts((prevLikedPosts) => {
      const updatedLikedPosts = new Set(prevLikedPosts);
      if (isLiked) {
        updatedLikedPosts.add(postId);
      } else {
        updatedLikedPosts.delete(postId);
      }
      return updatedLikedPosts;
    });
  };

  return (
    <>
      {auth.currentUser && (
        <section className="tabs top">
          <button
            className={`icon-label ${tab == "explore" && "active"}`}
            onClick={() => {
              setTab("explore");
              router.push("/?tab=explore");
            }}
          >
            <Compass /> Explorar
          </button>
          <button
            className={`icon-label ${tab == "following" && "active"}`}
            onClick={() => {
              setTab("following");
              router.push("/?tab=following");
            }}
          >
            <Users /> Seguindo
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
        <button
          className="icon"
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
        >
          <ArrowDown style={{ rotate: order === "asc" ? 0 : 180 }} />
        </button>
      </section>
      <div className="posts-container">
        {loading ? (
          <p>Carregando...</p>
        ) : posts.length ? (
          posts
            .filter((p) => p.isDraft == false)
            .map((post) => (
              <PostCard
                key={post.id}
                author={post.author}
                post={post}
                likedPosts={likedPosts}
                savedPosts={savedPosts}
                setLikedPosts={setLikedPosts}
                setSavedPosts={setSavedPosts}
                onSavePostChange={handleSavePostChange}
                onLikePostChange={handleLikePostChange}
              />
            ))
        ) : (
          <p>Nenhuma postagem encontrada</p>
        )}
      </div>
    </>
  );
}
