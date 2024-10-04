"use client";
import ShareMenu from "@/components/ShareMenu";
import { db, auth } from "@/firebase";
import {
  DotsThreeVertical,
  Pencil,
  Warning,
  PaperPlaneTilt,
  TextH,
  TextHOne,
  TextHTwo,
  TextHThree,
  TextHFour,
  TextHFive,
  TextHSix,
  TextB,
  TextItalic,
  CheckSquare,
  TextStrikethrough,
  Link,
  ListBullets,
  ListNumbers,
  Eye,
  Chats,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import CommentCard from "@/components/CommentCard";
import { toast } from "react-hot-toast";
import {marked} from "marked";

const CommentPage = ({ params }) => {
  const { username, post_path, comm_id } = params;
  const [postData, setPostData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [commentData, setCommentData] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [tabIsPreview, setTabIsPreview] = useState(false);
  const [tabIsComment, setTabIsComment] = useState(false);
  const shareRef = useRef(null);
  const menuRef = useRef(null);
  const headingRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
      if (headingRef.current && !headingRef.current.contains(event.target)) {
        headingRef.current.removeAttribute("open");
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
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            name: u.displayName || "Usuário",
            username: strFormat(u.displayName || "usuario"),
            photoURL: u.photoURL || "",
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

    const fetchData = async () => {
      if (username && post_path) {
        try {
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

          setPostData({
            ...postData,
            id: postId,
            title: postData.title,
            date: postData.date,
            authorName: authorData.name,
            authorUsername: authorData.username,
          });
          setAuthorData(authorData);

          if (
            comm_id &&
            postData.comments &&
            postData.comments.includes(comm_id)
          ) {
            const commRef = doc(db, "comments", comm_id);
            const commSnap = await getDoc(commRef);

            if (!commSnap.exists()) {
              router.push("/404");
              return;
            }

            const commData = commSnap.data();

            let replies = [];
            if (commData.comments && Array.isArray(commData.comments)) {
              replies = await Promise.all(
                commData.comments.map(async (replyId) => {
                  const replySnap = await getDoc(doc(db, "comments", replyId));
                  return replySnap.exists()
                    ? { id: replySnap.id, ...replySnap.data() }
                    : null;
                })
              );
            }

            setCommentData({
              ...commData,
              id: commSnap.id,
              replies: replies.filter((reply) => reply !== null),
            });
          }else{
            const commParentQuery = query(collection(db, "comments"), where(comm_id, "in", "comments"))
            const commParentSnap = await getDocs(commParentQuery);
            const commParentData = commParentSnap.docs[0];
            setCommentData({
             ...commParentData.data(),
              id: commParentData.id,
              replies: [],
            });
          }
        } catch (error) {
          console.error("Erro ao buscar dados: ", error);
          router.push("/404");
        }
      }
    };

    fetchData();

    return () => unsubscribe();
  }, [username, post_path, comm_id, router]);

  const strFormat = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
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

  const handleCommentSubmit = async () => {
    try {
      const newCommentId = doc(collection(db, "comments")).id;
      const commentData = {
        author: {
          username: user.username,
          name: user.name,
        },
        content: comment,
        _id: newCommentId,
        date: Timestamp.now(),
        postId: postData.path,
        parentId: comm_id || null, // Adiciona referência ao comentário pai, se existir
        comments: [],
      };

      await setDoc(doc(db, "comments", newCommentId), commentData);

      if (comm_id) {
        await updateDoc(doc(db, "comments", comm_id), {
          comments: arrayUnion(newCommentId),
        });
      } else {
        await updateDoc(doc(db, "posts", postData.id), {
          comments: arrayUnion(newCommentId),
        });
      }

      router.push(`/${username}/${post_path}/comments/${newCommentId}`);
      toast.success("Comentário enviado!");
    } catch (error) {
      toast.error("Erro ao enviar o comentário!");
      console.error("Erro ao enviar o comentário: ", error);
    }
  };

  if (!postData || !authorData) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      {" "}
      <section className="post_info">
        <div className="post_header">
          <div className="post_header_info">
            {comm_id ? (
              <>
                {commentData && commentData.parentId ? (
                  // Comentário dentro de outro comentário
                  <div className="parent_comment_info">
                    <p>
                      <strong>Comentário de:</strong>
                      {commentData.parentAuthor ? (
                        <a href={`/${commentData.parentAuthor.username}`}>
                          {commentData.parentAuthor.username}
                        </a>
                      ) : (
                        "Usuário desconhecido"
                      )}{" "}
                      • {formatTimestamp(commentData.date)}{" "}
                    </p>

                    <div
                      className="parent_comment_content"
                      dangerouslySetInnerHTML={{
                        __html: commentData.parentContent,
                      }}
                    ></div>
                  </div>
                ) : (
                  // Comentário direto na postagem
                  <div className="post_info_details">
                    <h2>
                      <a href={`/${authorData.username}/${postData.path}`}>
                        {postData.title}
                      </a>
                    </h2>

                    <p>
                      <a href={`/${authorData.username}`}>
                        {authorData.username}
                      </a>{" "}
                      • {formatTimestamp(postData.date)} •{" "}
                      {postData.comments.length}
                      {postData.comments.length === 1
                        ? "comentário"
                        : "comentários"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              // Visualização geral da postagem sem um comentário específico
              <div className="post_info_details">
                <h2>
                  <a href={`/${authorData.username}/${postData.path}`}>
                    {postData.title}{" "}
                  </a>
                </h2>

                <p>
                  <a href={`/${authorData.username}`}>{authorData.username}</a>{" "}
                  • {formatTimestamp(postData.date)} •{postData.comments.length} <Chats/>
                </p>
              </div>
            )}
          </div>

          <div className="post_header_buttons">
            <ShareMenu
              ref={shareRef}
              text={`Veja o comentário de ${authorData.name} no text.dev.br!`}
              link={`https://text.dev.br/${username}/${post_path}/comments/${comm_id}`}
              qrpath={`${username}/${post_path}`}
            />

            {username !== user?.username && (
              <details className="md" ref={menuRef}>
                <summary>
                  <DotsThreeVertical weight="bold" />
                </summary>

                <div className="left">
                  <a
                    href={`/${username}/${post_path}/report`}
                    className="btn icon-label danger"
                  >
                    Denunciar <Warning />{" "}
                  </a>
                </div>
              </details>
            )}
          </div>
        </div>
        <hr />
        {comm_id && commentData && !commentData.parentId ? (
          <div
            className="post_content"
            dangerouslySetInnerHTML={{ __html: commentData.content }}
          ></div>
        ) : null}
      </section>
      <hr/>
      <h3>Comentários</h3>
      <section className="form">
        {!tabIsComment ? (
          <button className="icon-label" onClick={() => setTabIsComment(true)}>
            Comentar <PaperPlaneTilt />
          </button>
        ) : (
          <>
            <div className="content_input">
              <div className="content_input_styles_textarea">
                <div className="content_input_styles">
                  <div className="content_input_styles_buttons">
                    <details className="md" ref={headingRef}>
                      <summary title="Títulos">
                        <TextH />
                      </summary>
                      <div>
                        <button
                          className="icon-label"
                          onClick={() => setComment(comment + "# ")}
                        >
                          Título 1<TextHOne />
                        </button>
                        <button
                          className="icon-label"
                          onClick={() => setComment(comment + "## ")}
                        >
                          Título 2<TextHTwo />
                        </button>
                        <button
                          className="icon-label"
                          onClick={() => setComment(comment + "### ")}
                        >
                          Título 3<TextHThree />
                        </button>
                        <button
                          className="icon-label"
                          onClick={() => setComment(comment + "#### ")}
                        >
                          Título 4<TextHFour />
                        </button>
                        <button
                          className="icon-label"
                          onClick={() => setComment(comment + "##### ")}
                        >
                          Título 5<TextHFive />
                        </button>
                        <button
                          className="icon-label"
                          onClick={() => setComment(comment + "###### ")}
                        >
                          Título 6 <TextHSix />
                        </button>
                      </div>
                    </details>
                    <button
                      className="icon"
                      onClick={() => setComment(comment + "**texto** ")}
                      title="Negrito"
                    >
                      <TextB />
                    </button>
                    <button
                      className="icon"
                      onClick={() => setComment(comment + "*texto* ")}
                      title="Itálico"
                    >
                      <TextItalic />
                    </button>
                    <button
                      className="icon"
                      onClick={() => setComment(comment + "~~texto~~ ")}
                      title="Tachado"
                    >
                      <TextStrikethrough />
                    </button>
                    <button
                      className="icon"
                      onClick={() =>
                        setComment(
                          comment + "[texto exibido](https://text.dev.br/)"
                        )
                      }
                      title="Link"
                    >
                      <Link />
                    </button>
                    <button
                      className="icon"
                      onClick={() =>
                        setComment(comment + "\n- item 1\n- item 2\n- item 3")
                      }
                      title="Lista não ordenada"
                    >
                      <ListBullets />
                    </button>
                    <button
                      className="icon"
                      onClick={() =>
                        setComment(
                          comment + "\n1. item 1\n2. item 2\n3. item 3"
                        )
                      }
                      title="Lista ordenada"
                    >
                      <ListNumbers />
                    </button>
                    <button
                      className="icon"
                      onClick={() =>
                        setComment(comment + "\n- [ ] item\n- [x] item")
                      }
                      title="Caixa de seleção"
                    >
                      <CheckSquare />
                    </button>
                  </div>
                  <div className="content_input_styles_slider">
                    <button
                      className={`icon ${!tabIsPreview && "active"}`}
                      onClick={() => setTabIsPreview(false)}
                    ></button>
                    <button
                      className={`icon ${tabIsPreview && "active"}`}
                      onClick={() => setTabIsPreview(true)}
                    >
                      <Eye />
                    </button>
                  </div>
                </div>
                {tabIsPreview ? (
                  <div
                    className="preview"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(comment),
                    }}
                  ></div>
                ) : (
                  <textarea
                    id="content"
                    value={comment.replaceAll("<br/>", "\n")}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conteúdo do comentário"
                  ></textarea>
                )}
              </div>
            </div>
            <div className="buttons">
              <button
                onClick={() => {
                  setTabIsComment(false);
                }}
              >
                Cancelar
              </button>
              <button className="active" onClick={handleCommentSubmit}>
                Comentar
              </button>
            </div>
          </>
        )}
      </section>
      <section className="comments">
        {commentData &&
        commentData.replies &&
        commentData.replies.length > 0 ? (
          commentData.replies
            .reverse()
            .map((comm, index) => (
              <CommentCard
                key={index}
                index={index}
                comm={comm}
                username={username}
                post_path={post_path}
              />
            ))
        ) : (
          <p>Nenhum comentário ainda.</p>
        )}
      </section>
    </>
  );
};

export default CommentPage;
