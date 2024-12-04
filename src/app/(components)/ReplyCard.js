import {
  BookmarkSimple,
  ChatTeardrop,
  DotsThreeVertical,
  Heart,
  Warning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ShareMenu from "./ShareMenu";
import { formatFullDate, formatTimeAgo } from "./format";

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
  console.log(reply.author);

  return (
    <div className="reply_card">
      <small className="reply_card_info">
        <Link href={`/u/${reply.author?.username}`}>
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
            <a
              className="btn danger icon-label"
              href={`/u/${reply.author.username}/${reply.id}/report`}
            >
              Denunciar <Warning />
            </a>
          </div>
        </details>
      </div>
      <div className="reply_card_content">
        <ChatTeardrop />
        <a
          href={`/u/${reply.author.username}/${reply.id}`}
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
          path={`u/${reply.author.username}/${reply.id}`}
        />
      </div>
    </div>
  );
};

export default ReplyCard;
