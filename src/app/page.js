"use client";
import { auth, db } from "@/firebase";
import { ArrowUp, MagnifyingGlass } from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAt,
  endAt,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            username: u.displayName,
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
          };
          await setDoc(docRef, userData);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [order, db]);

  const fetchPosts = async () => {
    try {
      let q = query(collection(db, "posts"), orderBy("date", order));
      const querySnapshot = await getDocs(q);
      const posts = [];

      for (const post of querySnapshot.docs) {
        const authorDocRef = doc(db, "users", post.data().author);
        const authorDoc = await getDoc(authorDocRef);
        const authorName = authorDoc.data().username;
        posts.push({ ...post.data(), id: post.id, authorName: authorName });
      }

      setPosts(posts);
    } catch (error) {
      toast.error("Erro ao buscar postagens!");
      console.error("Erro ao buscar postagens:", error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm) {
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("title"),
          startAt(searchTerm),
          endAt(searchTerm + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);
        const posts = [];

        for (const post of querySnapshot.docs) {
          const authorDocRef = doc(db, "users", post.data().author);
          const authorDoc = await getDoc(authorDocRef);
          const authorName = authorDoc.data().username;
          posts.push({ ...post.data(), id: post.id, authorName: authorName });
        }

        setPosts(posts);
      } catch (error) {
        toast.error("Erro ao buscar postagens!");
        console.error("Erro ao buscar postagens:", error);
      }
    } else {
      fetchPosts();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp) {
      const now = new Date();
      const date = timestamp.toDate();

      const diff = now - date;

      const diffInMinutes = Math.floor(diff / (1000 * 60));
      const diffInHours = Math.floor(diff / (1000 * 60 * 60));
      const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (diffInDays >= 2) {
        return `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()} - ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      } else if (diffInDays >= 1) {
        return `${diffInDays} ${diffInDays === 1 ? "dia" : "dias"} atrás`;
      } else if (diffInHours >= 1) {
        return `${diffInHours} ${diffInHours === 1 ? "hora" : "horas"} atrás`;
      } else {
        return `${diffInMinutes} ${
          diffInMinutes === 1 ? "minuto" : "minutos"
        } atrás`;
      }
    } else {
      return "";
    }
  };

  const strFormat = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll(" ", "-")
      .toLowerCase()
      .replaceAll("?", "")
      .replaceAll("!", "")
      .replaceAll("°", "")
      .replaceAll(",", "")
      .replaceAll(" - ", "-")
      .replaceAll(".", "-")
      .replaceAll("#", "");
  };

  if (!posts) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <section className="search">
        <button
          onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
          className={`icon ${order === "asc" && "rotate"}`}
        >
          <ArrowUp />
        </button>
        <input
          type="text"
          placeholder="Pesquisar"
          defaultValue={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="icon" onClick={handleSearch}>
          <MagnifyingGlass />
        </button>
      </section>
      <hr />
      <section className="list">
        {posts && posts.length === 0 ? (
          <p>Não há postagens ainda.</p>
        ) : (
          posts.map((post) => (
            <div className="post" key={post.id}>
              <h3>
                <a href={`/${post.authorName}/${post.path}`}>
                  {post.title}
                </a>
              </h3>
              <p>
                <a href={`/${post.authorName}`}>{post.authorName}</a> •{" "}
                {formatTimestamp(post.date)}
              </p>
            </div>
          ))
        )}
      </section>
    </>
  );
}
