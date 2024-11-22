"use client";
import { auth, db } from "@/firebase";
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
import {
  Heart,
  BookmarkSimple,
  DotsThreeVertical,
  TagSimple,
  Pencil,
  Warning,
} from "@phosphor-icons/react";
import {Image} from 'next/image';

const PostCard = (props) => {
  let {
    post,
    author,
    savedPosts,
    setSavedPosts,
    likedPosts,
    setLikedPosts,
    isProfile,
  } = props;

  const [likes, setLikes] = useState(post.likes);

  let shareRef = useRef(null);
  let menuRef = useRef(null);
  let tagsRef = useRef(null);

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

  const handleSavePost = async (postId) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      if (savedPosts?.includes(postId)) {
        setSavedPosts((prev) => prev.filter((id) => id !== postId));
        await updateDoc(userRef, { savedPosts: arrayRemove(postId) });
        toast.success("Post removido dos salvos!");
      } else {
        setSavedPosts((prev) => [...(prev || []), postId]);
        await updateDoc(userRef, { savedPosts: arrayUnion(postId) });
        toast.success("Post salvo com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao salvar/dessalvar o post!");
      console.error(error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const postRef = doc(db, "posts", postId);

      const isLiked = likedPosts?.includes(postId);
      await updateDoc(postRef, {
        likes: increment(isLiked ? -1 : 1),
      });

      setLikes(isLiked ? likes - 1 : likes + 1);

      if (isLiked) {
        setLikedPosts((prev) => prev.filter((id) => id !== postId));
        await updateDoc(userRef, { likedPosts: arrayRemove(postId) });
        toast.success("Postagem descurtida!");
      } else {
        setLikedPosts((prev) => [...(prev || []), postId]);
        await updateDoc(userRef, { likedPosts: arrayUnion(postId) });
        toast.success("Postagem curtida!");
      }
    } catch (error) {
      toast.error("Erro ao curtir/descurtir a postagem!");
      console.error(error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

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

  return (
    <div className="post_card" key={post.id}>
      <div className="post_card_info">
        <small>
          <Image
            src={
              author.photoURL ||
              `https://eu.ui-avatars.com/api/?name=${author.name.replaceAll(" ", "+")}&size=250`
            }
            width={16}
            height={16}
            className="post_card_author_photo"
          />
          <a href={`/${author.username}`}>{author.name}</a>
          <span>{"•"}</span>
          {formatTimestamp(post.date)}
          <span>{"•"}</span>
          <span>
            {Math.ceil(post.content.split(/\s/g).length / 200)} min. de leitura
          </span>
        </small>
        <h3>
          <a href={`/${author.username}/${post.path}`}>{post.title}</a>
        </h3>
        <div className="post_card_footer">
          <button
            onClick={() => handleLikePost(post.id)}
            className={`icon${likes!=0&&"-label"} ${likedPosts?.includes(post.id) ? "active" : ""}`}
          >
            <Heart
              weight={likedPosts?.includes(post.id) ? "fill" : "regular"}
            />
            {likes != 0 && likes}
          </button>

          <button
            className={`btn icon ${savedPosts?.includes(post.id) ? "active" : ""}`}
            onClick={() => handleSavePost(post.id)}
          >
            <BookmarkSimple
              weight={savedPosts?.includes(post.id) ? "fill" : "regular"}
            />
          </button>
          <ShareMenu
            side="right"
            ref={shareRef}
            text={`Veja a postagem ${post.title} de ${author.name} no text.dev.br!`}
            link={`https://text.dev.br/${author.username}/${post.path}/`}
            qrpath={`${author.username}/${post.path}`}
          />
          {post.tags && (
            <details className="md" ref={tagsRef}>
              <summary className="icon-label">
                <TagSimple /> {post.tags.length}
              </summary>
              <div className="right tags post">
                {post.tags.map((tag) => (
                  <span className="pill" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
      <div className="post_card_buttons">
        <details className="md" ref={menuRef}>
          <summary>
            <DotsThreeVertical weight="bold" />
          </summary>
          <div className="left">
            {isProfile ? (
              <a
                href={`/${author.username}/${post.path}/edit`}
                className="btn icon-label"
              >
                Editar postagem <Pencil />
              </a>
            ) : auth.currentUser ? (
              post.author.name == auth.currentUser.displayName ? (
                <a
                  href={`/${post.author.username}/${post.path}/edit`}
                  className="btn icon-label"
                >
                  Editar postagem <Pencil />
                </a>
              ) : (
                <a
                  href={`/${post.author.username}/${post.path}/report`}
                  className="btn icon-label danger"
                >
                  Denunciar
                  <Warning />
                </a>
              )
            ) : (
              <a
                href={`/${post.author.username}/${post.path}/report`}
                className="btn icon-label danger"
              >
                Denunciar
                <Warning />
              </a>
            )}
          </div>
        </details>
      </div>
    </div>
  );
};

export default PostCard;
