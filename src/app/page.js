"use client";
import { auth, db } from "@/firebase";
import {
  ArrowUp,
  CardsThree,
  ChatsTeardrop,
  Circle,
  X,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PostCard from "./(components)/PostCard";
import ReplyCard from "./(components)/ReplyCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [orderByDirection, setOrderByDirection] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) fetchUserData(user);
    });
    fetchPosts();
  }, [orderByDirection]); // Refaz a busca quando a direção da ordenação muda

  const fetchUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSavedPosts(new Set(userData.savedPosts || []));
        setLikedPosts(new Set(userData.likedPosts || []));
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "posts"),
        orderBy("date", orderByDirection)
      );
      const querySnapshot = await getDocs(q);
      const fetchedPosts = [];

      // Usar for...of para garantir que todas as promises sejam resolvidas
      for (const post of querySnapshot.docs) {
        const postData = post.data();
        const userDoc = await getDoc(doc(db, "users", postData.author));
        const username = userDoc.exists() ? userDoc.data().username : null;

        fetchedPosts.push({
          ...postData,
          author: { username: username, uid: postData.author },
        });
      }

      setPosts(fetchedPosts);
    } catch (error) {
      toast.error("Erro ao buscar posts");
    } finally {
      setLoading(false);
    }
  };

  const renderPosts = () => {
    let filteredPosts = posts;
    if (activeTab === "posts") {
      filteredPosts = posts.filter((post) => post.type === "post");
    } else if (activeTab === "comments") {
      filteredPosts = posts.filter((post) => post.type === "reply");
    }

    // Filtro de busca por título ou conteúdo
    return filteredPosts
      .filter((post) =>
        post.type === "post"
          ? searchTerm
            ? post.title?.toLowerCase().includes(searchTerm.toLowerCase())
            : true
          : searchTerm
            ? post.content?.toLowerCase().includes(searchTerm.toLowerCase())
            : true
      )
      .filter((post) => post.isDraft == false)
      .map((post, index) =>
        post.type === "reply" ? (
          <ReplyCard
            reply={post}
            key={index}
            likedPosts={likedPosts}
            savedPosts={savedPosts}
            setLikedPosts={setLikedPosts}
            setSavedPosts={setSavedPosts}
            inList={true}
          />
        ) : (
          <PostCard
            key={index}
            author={post.author}
            post={post}
            likedPosts={likedPosts}
            savedPosts={savedPosts}
            setLikedPosts={setLikedPosts}
            setSavedPosts={setSavedPosts}
          />
        )
      );
  };

  const toggleOrder = () => {
    const newOrder = orderByDirection === "desc" ? "asc" : "desc";
    setOrderByDirection(newOrder);
  };

  return (
    <>
      <section className="tabs top">
        <button
          className={`icon-label ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          <CardsThree />
          Postagens
        </button>
        <button
          className={`icon-label ${activeTab === "comments" ? "active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          <ChatsTeardrop />
          Comentários
        </button>
        <button
          className={`icon-label ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <Circle />
          Todos
        </button>
      </section>

      <section className="search">
        <div className="input_x">
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="icon" onClick={() => setSearchTerm("")}>
            <X />
          </button>
        </div>
        <button
          className={`icon ${orderByDirection === "asc" ? "rotate-180" : ""}`}
          onClick={toggleOrder}
        >
          <ArrowUp />
        </button>
      </section>

      <div className="post_list">
        {loading ? "Carregando..." : renderPosts()}
      </div>
    </>
  );
}
