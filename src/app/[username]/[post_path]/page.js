"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { marked } from "marked";
import {
  DotsThreeCircleVertical,
  Link,
  Pencil,
  Warning,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import markedAlert from "marked-alert";
import { baseUrl } from "marked-base-url";
//todo import markedCodeFormat from "marked-code-format";
import customHeadingId from "marked-custom-heading-id";
import { markedEmoji } from "marked-emoji";
import markedBidi from "marked-bidi";
const extendedTables = require("marked-extended-tables");


const PostPage = ({ params }) => {
  const router = useRouter();
  const { username, post_path } = params;
  const [postData, setPostData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [content, setContent] = useState("");
  const [emojis, setEmojis] = useState(null);

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

        setPostData({ ...postData, id: postId });
        setAuthorData(authorData);
        //* marked-alert marked-base-url marked-bidi marked-code-format marked-custom-heading-id marked-emoji marked-extended-tables

      // let emos = fetch(require("../../../../public/gitEmojis.min.json"));
      // let emojis;
      // emos.then(res=>{
      //   emojis = res.json()
      // })
        marked.use([
          markedAlert(),
          baseUrl("https://text.dev.br/"),
          // markedBidi,
          //todo: markedCodeFormat,
          customHeadingId(),
          // markedEmoji({emojis, renderer: (token) => `<img alt="${token.name}" src="${token.emoji}" class="marked-emoji-img">`}),
          extendedTables,
        ]);
        let md = marked.parse(postData.content || "", {gfm: true, breaks: true})
        setContent(md)
      }
    };

    fetchPostData();
  }, [username, post_path, router]);

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

  if (!postData || !authorData) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <section className="post_info">
        <div className="post_header">
          <h1>{postData.title}</h1>
          <p>
            <a href={`/${authorData.username}`}>{authorData.username}</a> •{" "}
            {formatTimestamp(postData.date)}
          </p>
        </div>
        <details className="md">
          <summary>
            <DotsThreeCircleVertical />
          </summary>
          <div style={{ right: 0 }}>
            {user && (
              <a
                href={`/${username}/${post_path}/edit/`}
                className="btn icon-label"
              >
                Editar postagem
                <Pencil />
              </a>
            )}
            <a
              href={`/report-post/?id=${postData.id}`}
              className="btn icon-label danger"
            >
              Denunciar
              <Warning />
            </a>
            <button
              className="icon-label"
              onClick={() => {
                toast.success("Link copiado!");
                navigator.clipboard.writeText(document.location.href);
              }}
            >
              Copiar link
              <Link />
            </button>
          </div>
        </details>
      </section>
      <hr />
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: content }}
      ></div>
      {postData.source && (
        <>
          <br />
          <p>
            <b>Fonte: </b>
            <a target="_blank" rel="noopener noreferrer" href={postData.source}>
              {postData.source.replace(/(^\w+:|^)\/\//, "")}
            </a>
          </p>
        </>
      )}
    </>
  );
};

export default PostPage;
