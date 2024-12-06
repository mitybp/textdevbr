"use client";
import PostCard from "@/(components)/PostCard";
import ShareMenu from "@/(components)/ShareMenu";
import { auth, db } from "@/firebase";
import {
  ArrowSquareOut,
  Cake,
  CardsThree,
  Circle,
  DotsThreeVertical,
  FacebookLogo,
  FileDashed,
  Gear,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  PencilSimple,
  PlusCircle,
  TwitterLogo,
  UserMinus,
  UserPlus,
  Warning,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { marked } from "marked";
import Image from "next/image";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";
import { formatDate, formatTimeAgo } from "@/(components)/format";

export default function UserPage({ params }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [isFollowing, setIsFollowing] = useState(false);

  const [userFollowers, setUserFollowers] = useState(0);
  const [userFollowing, setUserFollowing] = useState(0);

  const shareRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    router.replace(`/u/${params.username}?tab=${activeTab}`);
  }, [activeTab, params.username, router]);

  useEffect(() => {
    const fetchLoggedUserData = async (loggedUser) => {
      const loggedUserRef = doc(db, "users", loggedUser.uid);
      const loggedUserSnap = await getDoc(loggedUserRef);
      if (loggedUserSnap.exists()) {
        const loggedUserData = loggedUserSnap.data();
        setLoggedUser(loggedUserData);
        // Se o perfil é do usuário logado, busca diretamente seus dados
        if (params.username === loggedUserData.username) {
          fetchUserData(loggedUserData.username);
        } else {
          fetchUserData(params.username, loggedUser);
        }

        setSavedPosts(new Set(loggedUserData.savedPosts || []));
        setLikedPosts(new Set(loggedUserData.likedPosts || []));
      }
    };

    onAuthStateChanged(auth, (loggedUser) => {
      if (loggedUser) {
        fetchLoggedUserData(loggedUser);
      } else {
        fetchUserData(params.username, loggedUser);
      }
    });
  }, [params.username]);

  const fetchUserData = async (username, loggedUser) => {
    try {
      const userRef = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const userSnap = await getDocs(userRef);

      // Redireciona para 404 se o usuário não for encontrado
      if (userSnap.empty) {
        toast.error("Usuário não encontrado!");
        router.push("/404");
        return;
      }

      const userData = userSnap.docs[0].data();
      const userUid = userData.uid;
      const userDescription = marked(userData?.description || "");

      const postsRef = query(
        collection(db, "posts"),
        where("author", "==", userUid),
        orderBy("date", "desc")
      );
      const postsSnap = await getDocs(postsRef);
      const postsData = postsSnap.docs.map((doc) => doc.data());

      setUser(userData);
      setDescription(userDescription);
      setPosts(postsData);

      setUserFollowers(userData.followers.length || 0);
      setUserFollowing(userData.following.length || 0);

      // Verifica se o usuário logado está seguindo o usuário renderizado
      if (loggedUser && userData.followers.includes(loggedUser.uid)) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Erro ao carregar os dados do usuário:", error);
      toast.error("Erro ao carregar os dados do usuário!");
      router.push("/404"); // Redireciona para 404 em caso de erro
      return;
    }
  };

  const handleFollowUser = async () => {
    if (!loggedUser || !user) return;

    try {
      const loggedUserRef = doc(db, "users", loggedUser.uid);
      const userRef = doc(db, "users", user.uid);

      if (isFollowing) {
        await updateDoc(loggedUserRef, {
          following: arrayRemove(user.uid),
        });
        await updateDoc(userRef, {
          followers: arrayRemove(loggedUser.uid),
        });
        toast.success("Você deixou de seguir este usuário.");
        setUserFollowers(userFollowers - 1);
        setIsFollowing(false);
      } else {
        await updateDoc(loggedUserRef, {
          following: arrayUnion(user.uid),
        });
        await updateDoc(userRef, {
          followers: arrayUnion(loggedUser.uid),
        });
        toast.success("Você está seguindo este usuário!");
        setUserFollowers(userFollowers + 1);
        setIsFollowing(true);
      }
    } catch (error) {
      toast.error("Erro ao atualizar o status de seguir o usuário.");
      console.error(error);
    }
  };

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
  }, []);

  const handleLikePost = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Você precisa estar logado para curtir postagens!");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const postDocRef = doc(db, "posts", postId);

      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado!");
        return;
      }

      const userData = userDoc.data();
      const likedPosts = new Set(userData.likedPosts || []);

      if (likedPosts.has(postId)) {
        likedPosts.delete(postId);
        await updateDoc(postDocRef, {
          likes: increment(-1),
        });
        toast.error("Curtida removida!");
      } else {
        likedPosts.add(postId);
        await updateDoc(postDocRef, {
          likes: increment(1),
        });
        localStorage.setItem("newActivity", true);
        toast.success("Postagem curtida!");
      }

      // Atualiza o Firestore
      await updateDoc(userDocRef, { likedPosts: Array.from(likedPosts) });

      // Atualiza o estado local
      setLikedPosts(likedPosts);
    } catch (error) {
      console.error("Erro ao curtir postagem:", error);
      toast.error("Erro ao curtir postagem!");
    }
  };

  const handleSavePost = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Você precisa estar logado para salvar postagens!");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        toast.error("Usuário não encontrado!");
        return;
      }

      const userData = userDoc.data();
      const savedPosts = new Set(userData.savedPosts || []);

      if (savedPosts.has(postId)) {
        savedPosts.delete(postId);
        toast.error("Postagem removida dos salvos!");
      } else {
        savedPosts.add(postId);
        localStorage.setItem("newActivity", true);
        toast.success("Postagem salva!");
      }

      // Atualiza o Firestore
      await updateDoc(userDocRef, { savedPosts: Array.from(savedPosts) });

      // Atualiza o estado local
      setSavedPosts(savedPosts);
    } catch (error) {
      console.error("Erro ao salvar postagem:", error);
      toast.error("Erro ao salvar postagem!");
    }
  };

  if (!user || !posts) return <div>Carregando...</div>;

  const isOwnProfile = loggedUser && user.username === loggedUser.username;

  return (
    <>
      <section className="user_info">
        <div className="user_header">
          <>
            <div className="user_header_image">
              <Image
                width={100}
                height={100}
                src={`https://mitybp.github.io/media-textdevbr/${user.uid}.png`}
                alt="Foto do usuário"
                priority
              />
            </div>
            <div className="user_header_info">
              <small className="username">
                <b>{user.username}</b>
              </small>
              <small>
                <span>
                  {posts.filter((p) => p.isDraft == false).length} postagens
                </span>
                {userFollowers == 0 ? (
                  <span>0 seguidores</span>
                ) : (
                  <Link href={`/u/${user.username}/followers`}>
                    {userFollowers} seguidores
                  </Link>
                )}
                {userFollowing == 0 ? (
                  <span>0 seguindo</span>
                ) : (
                  <Link href={`/u/${user.username}/following`}>
                    {userFollowing} seguindo
                  </Link>
                )}
                <span>
                  <Cake />
                  {formatDate(user.joinedAt)}
                </span>
              </small>
              <div className="user_header_info_social">
                {[
                  {
                    name: "github",
                    url: "https://github.com/",
                    icon: <GithubLogo />,
                  },
                  {
                    name: "likedin",
                    url: "https://linkedin.com/",
                    icon: <LinkedinLogo />,
                  },
                  {
                    name: "instagram",
                    url: "https://instagram.com/",
                    icon: <InstagramLogo />,
                  },
                  {
                    name: "facebook",
                    url: "https://facebook.com/",
                    icon: <FacebookLogo />,
                  },
                  {
                    name: "twitter",
                    url: "https://x.com/",
                    icon: <TwitterLogo />,
                  },
                  {
                    name: "whatsapp",
                    url: "https://wa.me/",
                    icon: <WhatsappLogo />,
                  },
                ].map(
                  (social) =>
                    user.social[social.name] && (
                      <Link
                        key={social.name}
                        href={social.url + user.social[social.name]}
                        className={`btn icon${social.name == "github" ? "-label" : ""} pill`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.name == "github" ? (
                          <>
                            {social.icon}
                            {user.social[social.name]}
                          </>
                        ) : (
                          social.icon
                        )}
                      </Link>
                    )
                )}
              </div>
            </div>
          </>
          <div className="user_header_sidebar">
            <details className="md z" ref={menuRef}>
              <summary>
                <DotsThreeVertical weight="bold" />
              </summary>
              <div className="left">
                {isOwnProfile ? (
                  <>
                    <Link href="/settings/profile" className="btn icon-label">
                      Editar perfil <PencilSimple />
                    </Link>
                    <Link href="/settings/account" className="btn icon-label">
                      Configurações <Gear />
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/u/${params.username}/report/`}
                    className="btn icon-label danger"
                  >
                    Denunciar <Warning />
                  </Link>
                )}

                <ShareMenu
                  ref={shareRef}
                  text={`Veja o perfil de ${user.name} no text.dev.br!`}
                  path={"u/" + user.username}
                  side="inside"
                />
              </div>
            </details>
          </div>
        </div>
        <div className="user_footer">
          <div className="user_footer_info">
            <div className="user_footer_info_desc">
              {user.description && (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              )}
              {user.website && (
                <p className="website">
                  <ArrowSquareOut />
                  <Link
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.website.replace(/(^\w+:|^)\/\//, "").split("/")[0]}
                  </Link>
                </p>
              )}
              {!isOwnProfile && loggedUser && (
                <div className="user_footer_info_desc_actions">
                  <button
                    className={`icon-label ${!isFollowing && "active"}`}
                    onClick={handleFollowUser}
                  >
                    {isFollowing ? (
                      <>
                        Deixar de seguir
                        <UserMinus />
                      </>
                    ) : (
                      <>
                        Seguir
                        <UserPlus />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <hr />
      {isOwnProfile && (
        <section className="tabs">
          <button
            className={`icon-label ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Circle />
            Todos
          </button>
          <button
            className={`icon-label ${activeTab === "published" ? "active" : ""}`}
            onClick={() => setActiveTab("published")}
          >
            <CardsThree />
            Publicados
          </button>
          <button
            className={`icon-label ${activeTab === "drafts" ? "active" : ""}`}
            onClick={() => setActiveTab("drafts")}
          >
            <FileDashed />
            Rascunhos
          </button>
        </section>
      )}
      <section className="list">
        {posts.length === 0 ? (
          isOwnProfile ? (
            <section className="explore">
              <p>Você ainda não possui postagens</p>
              <Link href="/new" className="btn active icon-label">
                <PlusCircle />
                Criar postagem
              </Link>
            </section>
          ) : (
            <p>Este usuário ainda não possui postagens!</p>
          )
        ) : !isOwnProfile ? (
          posts
            .filter((p) => p.isDraft == false)
            .map((post, index) => (
              <PostCard
                key={index}
                post={post}
                author={user}
                savedPosts={savedPosts}
                likedPosts={likedPosts}
                handleLikePost={handleLikePost}
                handleSavePost={handleSavePost}
                isProfile={isOwnProfile}
              />
            ))
        ) : activeTab === "all" ? (
          posts.map((post, index) => (
            <PostCard
              key={index}
              post={post}
              author={user}
              savedPosts={savedPosts}
              likedPosts={likedPosts}
              handleLikePost={handleLikePost}
              handleSavePost={handleSavePost}
              isProfile={isOwnProfile}
            />
          ))
        ) : (
          posts
            .filter(
              (p) => p.isDraft == (activeTab == "published" ? false : true)
            )
            .map((post, index) => (
              <PostCard
                key={index}
                post={post}
                author={user}
                savedPosts={savedPosts}
                likedPosts={likedPosts}
                handleLikePost={handleLikePost}
                handleSavePost={handleSavePost}
                isProfile={isOwnProfile}
              />
            ))
        )}
      </section>
    </>
  );
}
