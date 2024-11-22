import { ChatCircle, Heart } from "@phosphor-icons/react";
import React, { useEffect, useState, useRef } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore"; // Adicionado updateDoc para atualizar likes
import { db } from "../firebase"; // Supondo que o db esteja importado de algum arquivo de configuração
import ShareMenu from "./ShareMenu";
import toast from "react-hot-toast";

const CommentCard = (props) => {
  const { comm, username, post_path, inActivity } = props;

  const [data, setData] = useState();
  const [likes, setLikes] = useState(comm.likes || 0);
  const [likedComments, setLikedComments] = useState(new Set());
  const shareRef = useRef(null);

  useEffect(() => {
    const fetchCommentData = async () => {
      const commentRef = doc(db, "comments", comm.id);
      const commentSnap = await getDoc(commentRef);
      if (commentSnap.exists()) {
        const commentAuthorRef = doc(db, "users", commentSnap.data().author);
        const commentAuthorSnap = await getDoc(commentAuthorRef);
        if (commentAuthorSnap.exists()) {
          const commAuthor = commentAuthorSnap.data();
          console.log(commAuthor);
          setData({
            ...commentSnap.data(),
            author: {
              username: commAuthor.username,
              name: commAuthor.name,
              photoURL: commAuthor.photoURL,
              uid: commAuthor.uid,
            },
          });
          console.log(data);
        }
      }
    };

    fetchCommentData();
  }, [comm]);

  const handleLikeComment = async (commentId) => {
    const updatedLikes = likedComments.has(commentId) ? likes - 1 : likes + 1;

    const userRef = doc(db, "users", data.author.uid);
    const commentRef = doc(db, "comments", commentId);

    await updateDoc(commentRef, { likes: updatedLikes });
    setLikes(updatedLikes);

    if (likedComments.has(commentId)) {
      setLikedComments((prev) => {
        const updated = new Set(prev);
        updated.delete(commentId);
        return updated;
      });
      await updateDoc(userRef, { likedComments: arrayRemove(commentId) });
      toast.success("Comentário descurtido!");
    } else {
      setLikedComments((prev) => {
        const updated = new Set(prev);
        updated.add(commentId);
        return updated;
      });
      await updateDoc(userRef, { likedComments: arrayUnion(commentId) });
      toast.success("Comentário curtido!");
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

  return (
    data && (
      <div className="comment_card">
        <div className="comment_card_header">
          <Link href={`/${data.author.username}`}>{data.author.username}</Link> •{" "}
          {formatTimestamp(data.date)}
        </div>
        <Link
          href={`/${data.author.username}/${data.id}`}
          className={`comment_card_content ${inActivity && "italic"}`}
          dangerouslySetInnerHTML={{ __html: data.content }}
        ></Link>
        <div className="comment_card_footer">
          <button
            onClick={() => handleLikeComment(data.id)}
            className={`icon-label ${likedComments.has(data.id) && "active"}`}
          >
            <Heart weight={likedComments.has(data.id) ? "fill" : "regular"} />
            {likes}
          </button>
          <Link
            href={`/${data.author.username}/${data.id}`}
            className={`btn ${data.comments.length != 0 ? "icon-label" : "icon"}`}
          >
            <ChatCircle />
            {data.comments.length != 0 && data.comments.length}
          </Link>
          <ShareMenu
            ref={shareRef}
            side="right"
            text={`Veja o comentário de ${data.author.name} no text.dev.br!`}
            path={`u/${username}/${post_path}`}
          />
        </div>
      </div>
    )
  );
};

import Link from "next/link";

export default CommentCard;
