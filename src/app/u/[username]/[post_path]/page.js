"use client";
import ContentForm from "@/(components)/ContentForm";
import { formatFullDate, formatTimeAgo } from "@/(components)/format";
import ReplyCard from "@/(components)/ReplyCard";
import ShareMenu from "@/(components)/ShareMenu";
import { auth, db } from "@/firebase";
import {
  BookmarkSimple,
  BracketsCurly,
  CheckSquare,
  Code,
  DotsThreeVertical,
  Eye,
  Heart,
  Link,
  ListBullets,
  ListNumbers,
  PencilSimple,
  Quotes,
  TextB,
  TextItalic,
  TextStrikethrough,
  Warning,
  X,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
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
  const [postReplies, setPostReplies] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likes, setLikes] = useState(0);
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [parentData, setParentData] = useState(null);
  const [modal, setModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [tabIsPreview, setTabIsPreview] = useState(false);

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

        if (postData.type == "post") {
          const resolvedReplies =
            postData && postData.replies.length > 0
              ? await Promise.all(
                  postData?.replies.map(async (reply) => {
                    const replyRef = doc(db, "posts", reply);
                    const replySnap = await getDoc(replyRef);
                    const replyData = replySnap.data();

                    const replyAuthorRef = doc(db, "users", replyData?.author);
                    const replyAuthorSnap = await getDoc(replyAuthorRef);
                    return {
                      ...replyData,
                      author: { username: replyAuthorSnap.data().username },
                      id: replySnap.id,
                    };
                  })
                )
              : [];
          setPostReplies(resolvedReplies);
        } else {
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
      }
    };
    fetchPostData();
  }, [username, post_path, router]);

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

  const handleSubmitReply = async () => {
    if (!user) {
      toast.error("Você precisa fazer login para comentar!");
      router.push(
        `/auth/login/?return=/u/${params.username}/${params.post_path}`
      );
      return;
    }
    if (!replyContent) {
      toast.error("Escreva algo para comentar!");
      return;
    }
    try {
      const replyRef = collection(db, "posts");
      const replyId = doc(replyRef).id;

      const newReply = {
        content: replyContent,
        date: new Date(),
        path: replyId,
        id: replyId,
        likes: 0,
        type: "reply",
        author: user.uid,
        parentId: postData.id,
      };
      await setDoc(doc(replyRef, replyId), newReply);
      await updateDoc(doc(db, "posts", postData.id), {
        replies: arrayUnion(replyId),
      });

      setModal(false);
      toast.success("Comentário enviado com sucesso!");
      router.refresh();
    } catch (err) {
      console.error("Erro ao salvar comentário:", err);
      toast.error("Erro ao enviar comentário!");
    }
  };

  if (!postData || !authorData) {
    return (
      <div className="loader">
        <span className="object"></span>
      </div>
    );
  } else if (postData.type == "post" && !postReplies) {
    return (
      <div className="loader">
        <span className="object"></span>
      </div>
    );
  }

  if (
    username == "settings" &&
    (post_path == "account" || post_path == "profile")
  ) {
    return;
  }
  const isOwnProfile = user && username === user.username;
  return (
    <>
      {modal && (
        <div className="modal">
          <div className="modal_container reply">
            <div className="modal_header">
              <h3>Escrever um comentário</h3>
              <button className="icon" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>
            <div className="modal_content">
              <ContentForm
                content={replyContent}
                setContent={setReplyContent}
                tabIsPreview={tabIsPreview}
                setTabIsPreview={setTabIsPreview}
                type="reply"
              />
              <div className="buttons">
                <button onClick={() => setModal(false)}>Cancelar</button>
                <button className="active" onClick={() => handleSubmitReply()}>
                  Publicar comentário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="post_info">
        <div className="post_header">
          <div className="post_header_info">
            {postData.type == "post" ? (
              <h1>{postData.title}</h1>
            ) : (
              <small>
                Em resposta à
                <a
                  href={`/u/${parentData?.author}/${parentData?.path}`}
                  className="post_header_reply_parent"
                >
                  <i>{parentData?.title}</i>
                </a>
              </small>
            )}
            <small>
              <a href={`/u/${authorData.username}`}>{authorData.username}</a>
              <span>{"•"}</span>
              <span
                className="tooltip"
                data-value={formatFullDate(postData.date)}
              >
                {formatTimeAgo(postData.date)}
              </span>
              {postData.type == "post" && (
                <>
                  <span>{"•"}</span>
                  <span>
                    {Math.ceil(String(content).split(/\s/g).length / 200)} min.
                    de leitura
                  </span>
                </>
              )}
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
                path={`u/${username}/${post_path}`}
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
                      href={`/u/${username}/${post_path}/edit`}
                      className="btn icon-label"
                    >
                      Editar
                      <PencilSimple />
                    </a>
                  ) : (
                    <a
                      className="btn icon-label danger"
                      href={`/u/${username}/${post_path}/report`}
                    >
                      Denunciar
                      <Warning />
                    </a>
                  )
                ) : (
                  <a
                    href={`/auth/login?redirect=/u/${username}/${post_path}`}
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
      {postData?.type == "post" && (
        <>
          <hr />
          <section className="replies">
            <div className="reply_header">
              <h3>Comentários</h3>
              <button
                className="icon-label active"
                onClick={() => setModal(true)}
              >
                Escrever <PencilSimple />
              </button>
            </div>

            <div className="reply_list">
              {postReplies &&
                postReplies
                  .reverse()
                  .map((reply) => (
                    <ReplyCard
                      reply={reply}
                      key={reply.id}
                      likedPosts={likedPosts}
                      savedPosts={savedPosts}
                      handleLikePost={handleLikePost}
                      handleSavePost={handleSavePost}
                    />
                  ))}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default PostPage;
