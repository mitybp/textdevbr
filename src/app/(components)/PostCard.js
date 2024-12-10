"use client";
import { auth } from "@/firebase";
import {
  BookmarkSimple,
  ChatTeardrop,
  DotsThreeVertical,
  Heart,
  PencilSimple,
  Warning,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import ShareMenu from "./ShareMenu";

const PostCard = (props) => {
  const {
    post,
    author,
    likedPosts,
    savedPosts,
    handleLikePost,
    handleSavePost,
    isProfile,
  } = props;

  const [likes, setLikes] = useState(post.likes || 0);
  const shareRef = useRef(null);
  const menuRef = useRef(null);
  const router=useRouter()

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
    <div className="post_card" key={post.id}>
      <div className="post_card_info">
        <small>
          <Link href={`/${author.username}`}>{author.username}</Link>
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
              <span className="warning">Rascunho</span>
            </>
          )}
        </small>
        <h3>
          <Link href={`/${author.username}/post/${post.path}`}>{post.title}</Link>
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
          <a
            href={`/${author.username}/post/${post.path}/#replies`}
            className={`btn icon${Array(post.replies).length==0?"":"-label"}`}
          >
            <ChatTeardrop />
            {Array(post.replies).length==0?"":Array(post.replies).length}
          </a>
          <ShareMenu
            side="right"
            ref={shareRef}
            text={`Veja a postagem ${post.title} de ${author.username} no text.dev.br!`}
            path={`${author.username}/${post.path}`}
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
                href={`/${author.username}/post/${post.path}/edit`}
                className="btn icon-label"
              >
                Editar postagem <PencilSimple />
              </Link>
            ) : auth.currentUser ? (
              author.uid === auth.currentUser.uid ? (
                <Link
                  href={`/${author.username}/post/${post.path}/edit`}
                  className="btn icon-label"
                >
                  Editar postagem <PencilSimple />
                </Link>
              ) : (
                <Link
                  href={`/${author.username}/post/${post.path}/report`}
                  className="btn icon-label danger"
                >
                  Denunciar
                  <Warning />
                </Link>
              )
            ) : (
              <Link
                href={`/${author.username}/post/${post.path}/report`}
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
import { formatFullDate, formatTimeAgo } from "./format";
import { useRouter } from "next/navigation";

export default PostCard;
