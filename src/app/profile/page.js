"use client";
import { auth, db } from "@/firebase";
import { DotsThreeCircleVertical, Link, Pencil, Gear } from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function Profile() {
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");

  const useFetchUserData = (setUser, setPosts) => {
    const router = useRouter();

    useEffect(() => {
      onAuthStateChanged(auth, async (u) => {
        if (u) {
          let temp_user = null;

          const userDocRef = doc(db, "users", u.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            temp_user = userDocSnap.data();
            setUser(temp_user);
            setDescription(marked(temp_user.description || ""));
          } else {
            const userData = {
              description: "",
              email: u.email,
              emailVerified: u.emailVerified,
              joinedAt: Timestamp.now(),
              username: u.displayName,
              photoURL: u.photoURL,
              uid: u.uid,
              website: "",
            };
            await setDoc(userDocRef, userData);
            temp_user = userData;
            setUser(userData);
            setDescription(marked(userData.description));
          }

          fetchPosts(temp_user.uid, setPosts);
        } else {
          router.push("/auth/login");
          toast.error("Faça login para acessar seu perfil.");
        }
      });

      const fetchPosts = async (userId, setPosts) => {
        const q = query(collection(db, "posts"), where("author", "==", userId));
        const postsDocSnap = await getDocs(q);
        let ps = [];
        if (!postsDocSnap.empty) {
          postsDocSnap.forEach((postDoc) => {
            ps.push({ ...postDoc.data(), id: postDoc.id });
          });
        }
        setPosts(ps);
      };
    }, [router, setPosts, setUser, setDescription]);
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
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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
            <Image width={100} height={100} src={user.photoURL} alt="user photo" />
            <h1>{user.username}</h1>
            {user.description && (
              <div dangerouslySetInnerHTML={{ __html: description }}></div>
            )}
            {user.website && (
              <p className="website">
                <Link />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.website.replace(/(^\w+:|^)\/\//, "")}
                </a>
              </p>
            )}
          </div>
          <details className="md">
            <summary>
              <DotsThreeCircleVertical />
            </summary>
            <div>
              <a href="/profile/edit/" className="btn icon-label">
                Editar <Pencil />
              </a>
              <a href="/profile/settings/" className="btn icon-label">
                Configurações <Gear />
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
        <section className="list">
          {posts.length == 0 ? (
            <p>
              Você não postou nada ainda.{" "}
              <a href="/new">Criar sua primeira postagem!</a>
            </p>
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
