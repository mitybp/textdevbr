"use client";
import { db } from "@/firebase";
import { DotsThreeCircleVertical, Link, Warning } from "@phosphor-icons/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function UserPage({ params }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");

  const useFetchUserData = () => {
    const router = useRouter();

    useEffect(() => {
      const fetchUser = async () => {
        const userRef = query(
          collection(db, "users"),
          where("username", "==", params.username)
        );
        const userSnap = await getDocs(userRef);

        if (userSnap.empty) {
          toast.error("Usuário não encontrado!");
          setUser(null);
        }

        const userData = userSnap.docs[0].data();
        const userUid = userData.uid;
        const userDescription = marked(userData.description);

        const postsRef = query(
          collection(db, "posts"),
          where("author", "==", userUid)
        );
        const postsSnap = await getDocs(postsRef);

        const postsData = postsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUser(userData);
        setDescription(userDescription);
        setPosts(postsData);
      };

      fetchUser();
    }, []);
  };

  useFetchUserData(setUser, setPosts);

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
          .padStart(2, "0")}/${date.getMinutes().toString().padStart(2, "0")}`;
      } else if (diffInDays >= 1) {
        return `${diffInDays} ${diffInDays == 1 ? "dia" : "dias"} atrás`;
      } else if (diffInHours >= 1) {
        return `${diffInHours} ${diffInHours == 1 ? "hora" : "horas"} atrás`;
      } else {
        return `${diffInMinutes} ${
          diffInMinutes == 1 ? "minuto" : "minutos"
        } atrás`;
      }
    } else {
      return "";
    }
  };

  const strFormat = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll(" ", "-")
      .toLowerCase()
      .replaceAll("?", "")
      .replaceAll("!", "")
      .replaceAll("°", "")
      .replaceAll(",", "")
      .replaceAll(" - ", "-")
      .replaceAll(".", "-")
      .replaceAll("#", "");
  };
  if (!user || !posts) {
    return <div>Carregando...</div>;
  }
  return (
    user &&
    posts && (
      <>
        <section className="user_info">
          <div>
            <Image src={user.photoURL} width={100} height={100} alt="user photo" />
            <h1>{user.username}</h1>
            <div dangerouslySetInnerHTML={{ __html: description }}></div>
            <p className="website">
              <Link />
              <a href={user.website} target="_blank" rel="noopener noreferrer">
                {user.website.replace(/(^\w+:|^)\/\//, "")}
              </a>
            </p>
          </div>
          <details className="md">
            <summary>
              <DotsThreeCircleVertical />
            </summary>
            <div>
              <button
                className="icon-label"
                onClick={() => {
                  toast.success("Link copiado!");
                  navigator.clipboard.writeText(`https://text.dev.br/${params.username}/${params.post_path}/`);
                }}
              >
                Copiar link
                <Link />
              </button>
              <a
                href={`/${params.username}/report/`}
                className="btn icon-label danger"
              >
                Denunciar <Warning />
              </a>
            </div>
          </details>
        </section>
        <hr />
        <section className="list">
          {posts.length == 0 ? (
            <p>Este usuário não possui nenhuma postagem.</p>
          ) : (
            posts.map((post) => (
              <div className="post" key={post.id}>
                <h3>
                  <a href={`/${user.username}/${post.path}`}>
                    {post.title}
                  </a>
                </h3>
                <p>
                  <a href={`/${user.username}`}>{user.username}</a> •{" "}
                  {formatTimestamp(post.date)}
                </p>
              </div>
            ))
          )}
        </section>
      </>
    )
  );
}
