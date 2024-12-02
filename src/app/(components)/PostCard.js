"use client";
import { auth, db } from "@/firebase";
import {
  BookmarkSimple,
  DotsThreeVertical,
  Heart,
  PencilSimple,
  Warning,
} from "@phosphor-icons/react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ShareMenu from "./ShareMenu";

const PostCard = (props) => {
  const {
    post,
    author,
    savedPosts,
    setSavedPosts,
    likedPosts,
    setLikedPosts,
    isProfile,
  } = props;

  const [likes, setLikes] = useState(post.likes || 0);
  const shareRef = useRef(null);
  const menuRef = useRef(null);
  const tagsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        tagsRef.current.removeAttribute("open");
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const updateUserPosts = async (
    type,
    userRef,
    postId,
    action,
    setState,
    toastMsg
  ) => {
    try {
      setState((prev) => {
        const newSet = new Set(prev);
        action === "add" ? newSet.add(postId) : newSet.delete(postId);
        return newSet;
      });

      const updateAction =
        action === "add" ? arrayUnion(postId) : arrayRemove(postId);
      await updateDoc(userRef, { [`${type}Posts`]: updateAction });
      toast.success(toastMsg);
    } catch (error) {
      toast.error("Erro ao atualizar o status da postagem!");
      console.error(error);
    }
  };

  // Dentro do PostCard, passe as mudanças para o pai
  const handleSavePost = async (postId) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const isSaved = savedPosts?.has(postId);

    await updateUserPosts(
      "saved",
      userRef,
      postId,
      isSaved ? "remove" : "add",
      setSavedPosts,
      isSaved ? "Post removido dos salvos!" : "Post salvo com sucesso!"
    );

    // Após a atualização, propague a mudança para o componente pai
    props.onSavePostChange(postId, !isSaved);
  };

  const handleLikePost = async (postId) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const postRef = doc(db, "posts", postId);
      const isLiked = likedPosts?.has(postId);

      await updateDoc(postRef, { likes: increment(isLiked ? -1 : 1) });
      setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));

      await updateUserPosts(
        "liked",
        userRef,
        postId,
        isLiked ? "remove" : "add",
        setLikedPosts,
        isLiked ? "Postagem descurtida!" : "Postagem curtida!"
      );

      // Após a atualização, propague a mudança para o componente pai
      props.onLikePostChange(postId, !isLiked);
    } catch (error) {
      toast.error("Erro ao curtir/descurtir a postagem.");
      console.error(error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = timestamp.toDate(); // Para Firestore Timestamp, converte para objeto Date
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

    if (years >= 1) return `${years} ${years === 1 ? "ano" : "anos"} atrás`;
    if (months >= 1) return `${months} ${months === 1 ? "mês" : "meses"} atrás`;
    if (weeks >= 1)
      return `${weeks} ${weeks === 1 ? "semana" : "semanas"} atrás`;
    if (days >= 1) return `${days} ${days === 1 ? "dia" : "dias"} atrás`;
    if (hours >= 1) return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
    return `${minutes} ${minutes === 1 ? "minuto" : "minutos"} atrás`;
  };

  const formatFullDate = (timestamp) => {
    const date = timestamp.toDate();
    const diasSemana = [
      "domingo",
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado",
    ];
    const meses = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];

    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");

    return `${diaSemana}, ${dia} de ${mes} de ${ano} às ${horas}:${minutos}`;
  };

  return (
    <div className="post_card" key={post.id}>
      <div className="post_card_info">
        <small>
          <Link href={`/u/${author.username}`}>{author.username}</Link>
          <span>{"•"}</span>
          <span className="tooltip" data-value={formatFullDate(post.date)}>
            {formatTimeAgo(post.date)}
          </span>
          <span>{"•"}</span>
          <span>
            {Math.ceil(String(post?.content).split(/\s/g).length / 200)} min. de
            leitura
          </span>

          {post.isDraft && (
            <>
              {"•"}
              <span className="alert">Rascunho</span>
            </>
          )}
        </small>
        <h3>
          <Link href={`/u/${author.username}/${post.path}`}>{post.title}</Link>
        </h3>
        <div className="post_card_footer">
          <button
            onClick={() => handleLikePost(post.id)}
            className={`${likes == 0 ? "icon" : "icon-label"} ${likedPosts?.has(post.id) ? "active" : ""}`}
          >
            <Heart weight={likedPosts?.has(post.id) ? "fill" : "regular"} />
            {likes !== 0 && likes}
          </button>
          <button
            className={`btn icon ${savedPosts?.has(post.id) ? "active" : ""}`}
            onClick={() => handleSavePost(post.id)}
          >
            <BookmarkSimple
              weight={savedPosts?.has(post.id) ? "fill" : "regular"}
            />
          </button>
          <ShareMenu
            side="right"
            ref={shareRef}
            text={`Veja a postagem ${post.title} de ${author.username} no text.dev.br!`}
            path={`u/${author.username}/${post.path}`}
          />
        </div>
      </div>
      <div className="post_card_buttons">
        <details className="md" ref={menuRef}>
          <summary>
            <DotsThreeVertical weight="bold" />
          </summary>
          <div className="left">
            {isProfile ? (
              <Link
                href={`/u/${author.username}/${post.path}/edit`}
                className="btn icon-label"
              >
                Editar postagem <PencilSimple />
              </Link>
            ) : auth.currentUser ? (
              author.uid === auth.currentUser.uid ? (
                <Link
                  href={`/u/${author.username}/${post.path}/edit`}
                  className="btn icon-label"
                >
                  Editar postagem <PencilSimple />
                </Link>
              ) : (
                <Link
                  href={`/u/${author.username}/${post.path}/report`}
                  className="btn icon-label danger"
                >
                  Denunciar
                  <Warning />
                </Link>
              )
            ) : (
              <Link
                href={`/u/${author.username}/${post.path}/report`}
                className="btn icon-label danger"
              >
                Denunciar
                <Warning />
              </Link>
            )}
          </div>
        </details>
      </div>
    </div>
  );
};

import Link from "next/link";

export default PostCard;
