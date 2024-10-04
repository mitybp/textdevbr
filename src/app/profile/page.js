"use client";
import PostCard from "@/components/PostCard";
import ShareMenu from "@/components/ShareMenu";
import { auth, db } from "@/firebase";
import {
  DotsThreeVertical,
  FacebookLogo,
  Gear,
  GithubLogo,
  InstagramLogo,
  Link,
  Pencil,
  TwitterLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie"; // Importando a biblioteca para cookies

export default function Profile() {
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());

  const shareRef = useRef(null);
  const menuRef = useRef(null);
  const router = useRouter();
  const team = ["dimitri.pusch"];

  const fetchPosts = async (userId) => {
    const q = query(collection(db, "posts"), where("author", "==", userId));
    const postsDocSnap = await getDocs(q);
    const ps = postsDocSnap.docs.map((postDoc) => ({
      ...postDoc.data(),
      id: postDoc.id,
    }));
    setPosts(ps);
  };

  useEffect(() => {
    document.title = "Meu perfil - text.dev.br";
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userDocSnap = await getDoc(userDocRef);

        let temp_user = null;

        if (userDocSnap.exists()) {
          temp_user = userDocSnap.data();
          setUser(temp_user);
          setDescription(marked(temp_user.description || ""));
          // Armazenar informações do usuário nos cookies
          Cookies.set('user', JSON.stringify(temp_user), { expires: 7 }); // Exemplo: expira em 7 dias
        } else {
          toast.error("")
        }

        fetchPosts(temp_user.uid);
      } else {
        router.push("/auth/login");
        toast.error("Faça login para acessar seu perfil.");
      }
    });
  }, [router]);

  if (!user || !posts) {
    return <div>Carregando...</div>;
  }

  return (
    user && (
      <>
        {!user.emailVerified && (
          <div className="alert">
            <h3>Verifique seu email!</h3>
            <small>
              Verificando seu email torna a nossa comunidade mais segura,{" "}
              <a href="/auth/verify-email">clique aqui</a> para verificar.
            </small>
          </div>
        )}
        <section className="user_info">
          <div className="user_header_center">
            <Image
              width={80}
              height={80}
              src={user.photoURL}
              alt="user photo"
            />
            <h1>{user.name}</h1>
            <small className="user_header_username">
              {user.username}
              {team.includes(user.username) && (
                <span className="pill">.dev</span>
              )}
            </small>
          </div>
          <div className="user_flex">
            <div className="user_header">
              <div className="user_header_info">
                <div className="user_header_info_social">
                  {user.social.github && (
                    <a
                      href={`https://github.com/${user.social.github}`}
                      className="btn icon-label pill profile"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubLogo />
                      <span>{user.social.github}</span>
                    </a>
                  )}
                  {user.social.instagram && (
                    <a
                      href={`https://instagram.com/${user.social.instagram}`}
                      className="btn icon pill"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramLogo />
                    </a>
                  )}
                  {user.social.facebook && (
                    <a
                      href={`https://facebook.com/${user.social.facebook}`}
                      className="btn icon pill"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FacebookLogo />
                    </a>
                  )}
                  {user.social.twitter && (
                    <a
                      href={`https://x.com/${user.social.twitter}`}
                      className="btn icon pill"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TwitterLogo />
                    </a>
                  )}
                  {user.social.threads && (
                    <a
                      href={`https://threads.net/@${user.social.threads}`}
                      className="btn icon pill"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramLogo />
                    </a>
                  )}
                  {user.social.whatsapp && (
                    <a
                      href={`https://wa.me/${user.social.whatsapp}`}
                      className="btn icon pill"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsappLogo />
                    </a>
                  )}
                </div>
                <div className="user_header_info">
                  {user.description && (
                    <div
                      dangerouslySetInnerHTML={{ __html: description }}
                    ></div>
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
              </div>
            </div>
            <div className="user_footer">
              <ShareMenu
                ref={shareRef}
                text={`Veja o perfil do(a) ${user.name} no text.dev.br!`}
                link={`https://text.dev.br/${user.username}`}
                qrpath={user.username}
              />
              <details className="md" ref={menuRef}>
                <summary>
                  <DotsThreeVertical weight="bold" />
                </summary>
                <div className="left">
                  <a href="/profile/edit" className="btn icon-label">
                    Editar perfil <Pencil />
                  </a>
                  <a href="/profile/settings" className="btn icon-label">
                    Configurações <Gear />
                  </a>
                </div>
              </details>
            </div>
          </div>
        </section>
        <hr />
        <section className="list">
          {posts.length === 0 ? (
            <p>
              Você não postou nada ainda.{" "}
              <a href="/new">Criar sua primeira postagem!</a>
            </p>
          ) : (
            posts.map((post, index) => (
              <PostCard
                isProfile={true}
                key={index}
                post={post}
                user={user}
                savedPosts={savedPosts}
                setSavedPosts={setSavedPosts}
                likedPosts={likedPosts}
                setLikedPosts={setLikedPosts}
                index={index}
              />
            ))
          )}
        </section>
      </>
    )
  );
}
