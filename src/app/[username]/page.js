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
  Warning,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { marked } from "marked";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function UserPage({ params }) {
  const [user, setUser] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const shareRef = useRef(null);
  const menuRef = useRef(null);
  const router = useRouter();

  const team = ["dimitri.pusch"];

  useEffect(() => {
    const fetchUserData = async (username) => {
      const userRef = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const userSnap = await getDocs(userRef);

      if (userSnap.empty) {
        toast.error("Usuário não encontrado!");
        setUser(null);
        return;
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

    onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        const loggedUserRef = doc(db, "users", loggedUser.uid);
        const loggedUserSnap = await getDoc(loggedUserRef);
        if (loggedUserSnap.exists()) {
          setLoggedUser(loggedUserSnap.data());
        }
        if (params.username === loggedUserSnap.data().username) {
          fetchUserData(loggedUserSnap.data().username);
        } else {
          fetchUserData(params.username);
        }
      } else {
        fetchUserData(params.username);
      }
    });
  }, [params.username]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [user]);

  if (!user || !posts) return <div>Carregando...</div>;

  const isOwnProfile = loggedUser && user.username === loggedUser.username;

  return (
    <>
      <section className="user_info">
        <div className="user_header_center">
          <Image width={80} height={80} src={user.photoURL} alt="user photo" />
          <h1>{user.name}</h1>
          <small>
            {user.username}
            {team.includes(user.username) && <span className="pill">.dev</span>}
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
                {isOwnProfile ? (
                  <>
                    <a
                      href={`/${params.username}/edit`}
                      className="btn icon-label"
                    >
                      Editar perfil <Pencil />
                    </a>
                    <a
                      href={`/${params.username}/settings`}
                      className="btn icon-label"
                    >
                      Configurações <Gear />
                    </a>
                  </>
                ) : (
                  <a
                    href={`/${params.username}/report/`}
                    className="btn icon-label danger"
                  >
                    Denunciar <Warning />
                  </a>
                )}
              </div>
            </details>
          </div>
        </div>
      </section>
      <hr />
      <section className="list">
        {posts.length === 0 ? (
          <p>Este usuário não possui nenhuma postagem.</p>
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
  );
}
