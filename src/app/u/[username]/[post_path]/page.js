"use client";
import ShareMenu from "@/(components)/ShareMenu";
import { auth, db } from "@/firebase";
import {
  BookmarkSimple,
  DotsThreeVertical,
  Heart,
  PencilSimple,
  Warning,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { marked } from "marked";
import markedAlert from "marked-alert";
import { baseUrl } from "marked-base-url";
import customHeadingId from "marked-custom-heading-id";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
const extendedTables = require("marked-extended-tables");

const PostPage = ({ params }) => {
  const { username, post_path } = params;
  const [user, setUser] = useState(null);
  const [postData, setPostData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [content, setContent] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likes, setLikes] = useState(0);
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [saves, setSaves] = useState(0);

  const menuRef = useRef(null);
  const shareRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const signIn = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser(userData);
          setLikedPosts(new Set(userData.likedPosts || []));
          setSavedPosts(new Set(userData.savedPosts || []));
        } else {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            name: u.displayName,
            username: strFormat(u.displayName),
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
            github: "",
            savedPosts: [],
          };
          await setDoc(docRef, userData);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    });

    const fetchPostData = async () => {
      if (username && post_path) {
        const postRef = query(
          collection(db, "posts"),
          where("path", "==", post_path)
        );
        const postSnap = await getDocs(postRef);

        if (postSnap.empty) {
          router.push("/404");
          return;
        }

        const postDoc = postSnap.docs[0];
        const postData = postDoc.data();
        const postId = postDoc.id;
        const authorRef = doc(db, "users", postData.author);
        const authorSnap = await getDoc(authorRef);

        if (!authorSnap.exists()) {
          router.push("/404");
          return;
        }

        const authorData = authorSnap.data();

        if (authorData.username !== username) {
          router.push("/404");
          return;
        }

        setLikes(postData.likes);
        setPostData({ ...postData, id: postId });
        setAuthorData(authorData);

        marked.use([
          markedAlert(),
          baseUrl("https://text.dev.br/"),
          customHeadingId(),
          extendedTables,
        ]);
        const mdContent = marked.parse(postData.content || "", {
          gfm: true,
          breaks: true,
        });
        setContent(mdContent);
      }
    };
    fetchPostData();

    return () => signIn();
  }, [username, post_path, router]);

  const formatTimestamp = (timestamp) => {
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
  };

  const handleLikePost = async (postId) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {
        likes: increment(likedPosts.has(postId) ? -1 : 1),
      });

      setLikes((prevLikes) => prevLikes + (likedPosts.has(postId) ? -1 : 1));

      if (likedPosts.has(postId)) {
        setLikedPosts((prev) => {
          const updated = new Set(prev);
          updated.delete(postId);
          return updated;
        });
        await updateDoc(userRef, { likedPosts: arrayRemove(postId) });
        toast.success("Postagem descurtida!");
      } else {
        setLikedPosts((prev) => new Set(prev).add(postId));
        await updateDoc(userRef, { likedPosts: arrayUnion(postId) });
        toast.success("Postagem curtida!");
      }
    } catch (error) {
      toast.error("Erro ao curtir/descurtir a postagem!");
      console.error(error);
    }
  };

  if (!postData || !authorData) {
    return <div>Carregando...</div>;
  }

  
  const isOwnProfile = user && username === user.username;

  if (username=="settings" && (post_path=="account" || post_path=="profile")) {
    return;
  }
  return (
    <>
      <section className="post_info">
        <div className="post_header">
          <div className="post_header_info">
            <h1>{postData.title}</h1>
            <small>
              <Link href={`/u/${authorData.username}`}>{authorData.username}</Link>
              <span>{"•"}</span>
              <span
                className="tooltip"
                data-value={formatTimestamp(postData.date)}
              >
                {formatTimestamp(postData.date)}
              </span>
              <span>{"•"}</span>
              <span>
                {Math.ceil(String(content).split(/\s/g).length / 200)} min. de
                leitura
              </span>
              {postData.isDraft&&(
                <>
              <span>{"•"}</span>
              <span className="alert">Rascunho</span>
              </>
              )}
            </small>
            <div className="post_footer">
              <button
                onClick={() => handleLikePost(postData.id)}
                className={`icon-label ${likedPosts.has(postData.id) && "active"}`}
              >
                <Heart
                  weight={likedPosts.has(postData.id) ? "fill" : "regular"}
                />
                {likes}
              </button>

              <button
                className={`btn icon ${savedPosts?.has(postData.id) ? "active" : ""}`}
                onClick={() => handleSavePost(postData.id)}
              >
                <BookmarkSimple
                  weight={savedPosts?.has(postData.id) ? "fill" : "regular"}
                />
              </button>
            </div>
          </div>

          <div className="post_header_buttons">
            <details className="md z" ref={menuRef}>
              <summary>
                <DotsThreeVertical weight="bold" />
              </summary>
              <div className="left">
                {auth.currentUser ? (
                  isOwnProfile ? (
                    <Link
                      href={`/u/${username}/${post_path}/edit`}
                      className="btn icon-label"
                    >
                      Editar
                      <PencilSimple />
                    </Link>
                  ) : (
                    <Link
                      className="btn icon-label danger"
                      href={`/u/${username}/${post_path}/report`}
                    >
                      Denunciar
                      <Warning />
                    </Link>
                  )
                ) : (
                  <Link
                    href={`/auth/login?redirect=/u/${username}/${post_path}`}
                    className="btn icon-label danger"
                  >
                    Entrar para reportar
                    <Warning />
                  </Link>
                )}
              </div>
            </details>
            <ShareMenu
              side="left"
              ref={shareRef}
              text={`Veja a postagem ${postData.title} de ${authorData.name} no text.dev.br!`}
              path={`u/${username}/${post_path}`}
            />
          </div>
        </div>

        <article className="post_content">
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </section>
    </>
  );
};

import Link from "next/link";

export default PostPage;
