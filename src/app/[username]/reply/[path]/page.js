"use client";
import { formatFullDate, formatTimeAgo } from "@/(components)/format";
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
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
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
  const { username, path } = params;
  const [user, setUser] = useState(null);
  const [postData, setPostData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [content, setContent] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likes, setLikes] = useState(0);
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [parentData, setParentData] = useState(null);

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
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        let userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          let userData = userDoc.data();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        setUser(null);
      }
    });

    setInterval(() => {
      return () => unsubscribe();
    }, 10000);
  }, [router]);

  useEffect(() => {
    const fetchUserInteractions = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setLikedPosts(new Set(userData.likedPosts || []));
          setSavedPosts(new Set(userData.savedPosts || []));
        }
      }
    };

    fetchUserInteractions();
  }, [user]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (username && path) {
        const postRef = query(
          collection(db, "posts"),
          where("path", "==", path)
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

        const parentSnap = await getDoc(doc(db, "posts", postData.parentId));
        const parentData = parentSnap.data();
        const parentAuthorSnap = await getDoc(
          doc(db, "users", parentData.author)
        );
        const parentAuthorData = parentAuthorSnap.data();

        setParentData({
          title: parentData.title,
          path: parentData.path,
          author: parentAuthorData.username,
        });
      }
    };
    fetchPostData();
  }, [username, path, router]);

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
        setLikes((prevLikes) => prevLikes - 1); // Atualiza a contagem local de likes
        toast.error("Curtida removida!");
      } else {
        likedPosts.add(postId);
        await updateDoc(postDocRef, {
          likes: increment(1),
        });
        setLikes((prevLikes) => prevLikes + 1); // Atualiza a contagem local de likes
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

  if (!postData || !authorData) {
    return (
      <div className="loader">
        <span className="object"></span>
      </div>
    );
  }

  if (username == "settings" && (path == "account" || path == "profile")) {
    return;
  }
  const isOwnProfile = user && username === user.username;
  return (
    <>
      <section className="post_info">
        <div className="post_header">
          <div className="post_header_info">
            <small>
              Em resposta à
              <a
                href={`/${parentData?.author}/post/${parentData?.path}`}
                className="post_header_reply_parent"
              >
                <i>{parentData?.title}</i>
              </a>
            </small>
            <small>
              <a href={`/${authorData.username}`}>{authorData.username}</a>
              <span>{"•"}</span>
              <span
                className="tooltip"
                data-value={formatFullDate(postData.date)}
              >
                {formatTimeAgo(postData.date)}
              </span>
              {postData.isDraft && (
                <>
                  <span>{"•"}</span>
                  <span className="alert">Rascunho</span>
                </>
              )}
            </small>
            <div className="post_footer">
              <button
                onClick={() => handleLikePost(postData.id)}
                className={`${likes == 0 ? "icon" : "icon-label"} ${likedPosts?.has(postData.id) ? "active" : ""}`}
              >
                <Heart
                  weight={likedPosts.has(postData.id) ? "fill" : "regular"}
                />
                {likes != 0 && likes}
              </button>

              <button
                className={`btn icon ${savedPosts?.has(postData.id) ? "active" : ""}`}
                onClick={() => handleSavePost(postData.id)}
              >
                <BookmarkSimple
                  weight={savedPosts?.has(postData.id) ? "fill" : "regular"}
                />
              </button>

              <ShareMenu
                side="right"
                ref={shareRef}
                text={`Veja a postagem ${postData.title} de ${authorData.username} no text.dev.br!`}
                path={`${username}/${path}`}
              />
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
                    <a
                      href={`/${username}/reply/${path}/edit`}
                      className="btn icon-label"
                    >
                      Editar
                      <PencilSimple />
                    </a>
                  ) : (
                    <a
                      className="btn icon-label danger"
                      href={`/${username}/reply/${path}/report`}
                    >
                      Denunciar
                      <Warning />
                    </a>
                  )
                ) : (
                  <a
                    href={`/auth/login?redirect=/${username}/reply/${path}`}
                    className="btn icon-label danger"
                  >
                    Entrar para reportar
                    <Warning />
                  </a>
                )}
              </div>
            </details>
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

export default PostPage;
