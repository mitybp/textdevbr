import {
  BookmarkSimple,
  ChatTeardrop,
  DotsThreeVertical,
  Heart,
  Warning,
  PencilSimple,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ShareMenu from "./ShareMenu";
import { formatFullDate, formatTimeAgo } from "./format";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";  // Importando o auth do Firebase

const ReplyCard = ({
  reply,
  inList = false,
  likedPosts,
  savedPosts,
  handleLikePost,
  handleSavePost,
}) => {
  const shareRef = useRef(null);
  const menuRef = useRef(null);
  const [loggedUser, setLoggedUser] = useState(null);

  // Verifica o usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedUser(user.uid); // Define o uid do usuário logado
      } else {
        setLoggedUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="reply_card">
      <small className="reply_card_info">
        <Link href={`/${reply.author?.username}`}>
          {reply.author.username}
        </Link>
        <span>{"•"}</span>
        <span className="tooltip" data-value={formatFullDate(reply.date)}>
          {formatTimeAgo(reply.date)}
        </span>
      </small>
      <div className="reply_card_sidebar">
        <details className="md" ref={menuRef}>
          <summary>
            <DotsThreeVertical />
          </summary>
          <div className="left">
            {loggedUser === reply.author.uid ? (
              <a className="btn icon-label" href={`/${reply.author.username}/reply/${reply.id}/edit`}>
                Editar <PencilSimple />
              </a>
            ) : (
              <a
                className="btn danger icon-label"
                href={`/${reply.author.username}/reply/${reply.id}/report`}
              >
                Denunciar <Warning />
              </a>
            )}
          </div>
        </details>
      </div>
      <div className="reply_card_content">
        <a
          href={`/${reply.author.username}/reply/${reply.id}`}
          className={`reply_card_content_render ${inList ? "italic" : ""}`}
          dangerouslySetInnerHTML={{ __html: reply.content }}
        />
      </div>
      <div className="reply_card_footer">
        <button
          onClick={() => handleLikePost(reply.id)}
          className={`${likedPosts.size == 0 ? "icon" : "icon-label"} ${likedPosts?.has(reply.id) ? "active" : ""}`}
        >
          <Heart weight={likedPosts?.has(reply.id) ? "fill" : "regular"} />
          {likedPosts.size !== 0 && likedPosts.size}
        </button>
        <button
          className={`btn icon ${savedPosts?.has(reply.id) ? "active" : ""}`}
          onClick={() => handleSavePost(reply.id)}
        >
          <BookmarkSimple
            weight={savedPosts?.has(reply.id) ? "fill" : "regular"}
          />
        </button>
        <ShareMenu
          side="right"
          ref={shareRef}
          text={`Veja a comentário de ${reply.author.username} no text.dev.br!`}
          path={`${reply.author.username}/reply/${reply.id}`}
        />
      </div>
    </div>
  );
};

export default ReplyCard;
