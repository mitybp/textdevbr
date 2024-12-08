"use client";
import PostCard from "@/(components)/PostCard";
import ShareMenu from "@/(components)/ShareMenu";
import { auth, db } from "@/firebase";
import {
  ArrowSquareOut,
  Cake,
  CardsThree,
  ChatTeardrop,
  Circle,
  DotsThreeVertical,
  FacebookLogo,
  FileDashed,
  Gear,
  GithubLogo,
  GlobeSimple,
  InstagramLogo,
  LinkedinLogo,
  PencilSimple,
  PlusCircle,
  TwitterLogo,
  UserMinus,
  UserPlus,
  Warning,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
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
import { formatDate, formatNumber, formatTimeAgo } from "@/(components)/format";
import ReplyCard from "@/(components)/ReplyCard";

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

  const [modal, setModal] = useState({ isOpen: false, type: "" });

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

  const fetchFollowersAndFollowing = async (userUid) => {
    try {
      // Obtenha os documentos dos seguidores
      const followersQuery = query(
        collection(db, "users"),
        where("following", "array-contains", userUid)
      );
      const followersSnap = await getDocs(followersQuery);
      const followersData = followersSnap.docs.map((doc) => ({
        username: doc.data().username,
        photoURL:
          doc.data().photoURL ||
          `https://eu.ui-avatars.com/api/?name=${doc.data().username.replace("-", "+").replace(".", "+").replace("_", "+")}`,
      }));

      // Obtenha os documentos dos usuários que o usuário está seguindo
      const followingQuery = query(
        collection(db, "users"),
        where("followers", "array-contains", userUid)
      );
      const followingSnap = await getDocs(followingQuery);
      const followingData = followingSnap.docs.map((doc) => ({
        username: doc.data().username,
        photoURL:
          doc.data().photoURL ||
          `https://eu.ui-avatars.com/api/?name=${doc.data().username.replace("-", "+").replace(".", "+").replace("_", "+")}`,
      }));

      setUserFollowers(followersData);
      setUserFollowing(followingData);
    } catch (error) {
      console.error("Erro ao carregar seguidores e seguindo:", error);
      toast.error("Erro ao carregar seguidores e seguindo!");
    }
  };

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
      await fetchFollowersAndFollowing(userData.uid);
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

  const renderPosts = (posts) => {
    if (posts.length > 0) {
      if (activeTab == "all") {
        return posts.map((post, index) =>
          post.type == "post" ? (
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
          ) : (
            <ReplyCard
              key={index}
              reply={{ ...post, author: user }}
              savedPosts={savedPosts}
              likedPosts={likedPosts}
              handleLikePost={handleLikePost}
              handleSavePost={handleSavePost}
              inList={true}
            />
          )
        );
      } else if (activeTab == "published") {
        let postsFilter = posts
          .filter((post) => post.type == "post")
          .filter((post) => post.isDraft == false);
        if (postsFilter.length > 0) {
          return postsFilter.map((post, index) => (
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
          ));
        } else {
          if (isOwnProfile) {
            return <p>Você não possui postagens publicadas!</p>;
          } else {
            return <p>Este usuário não possui postagens publicadas!</p>;
          }
        }
      } else if (activeTab == "drafts") {
        let draftFilter = posts
          .filter((post) => post.type == "post")
          .filter((post) => post.isDraft == true);
        if (isOwnProfile) {
          if (draftFilter.length > 0) {
            return draftFilter.map((post, index) => (
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
            ));
          } else {
            return <p>Você não possui postagens em rascunho!</p>;
          }
        } else {
          return (
            <p>Você não tem permissão para ver os rascunhos do usuário!</p>
          );
        }
      } else if (activeTab == "replies") {
        let repliesFilter = posts.filter((post) => post.type == "reply");
        if (repliesFilter.length > 0) {
          return repliesFilter.map((post, index) => (
            <ReplyCard
              key={index}
              reply={{ ...post, author: user }}
              savedPosts={savedPosts}
              likedPosts={likedPosts}
              handleLikePost={handleLikePost}
              handleSavePost={handleSavePost}
              inList={true}
            />
          ));
        } else {
          if (isOwnProfile) {
            return <p>Você não fez comentários!</p>;
          } else {
            return <p>Este usuário não fez comentários!</p>;
          }
        }
      }
    } else {
      if (isOwnProfile) {
        return (
          <section className="explore">
            <p>Você ainda não possui postagens</p>
            <Link href="/new" className="btn active icon-label">
              <PlusCircle />
              Criar postagem
            </Link>
          </section>
        );
      } else {
        return <p>Este usuário ainda não possui postagens!</p>;
      }
    }
  };

  if (!user || !posts) {
    return (
      <div className="loader">
        <span className="object"></span>
      </div>
    );
  }

  const isOwnProfile = loggedUser && user.username === loggedUser.username;

  return (
    <>
      {modal.isOpen && (
        <div className="modal">
          <div className="modal_container">
            <div className="modal_header">
              <h3>{modal.type == "following" ? "Seguindo" : "Seguidores"}</h3>
              <button
                className="icon"
                onClick={() => setModal({ isOpen: false, type: "" })}
              >
                <X />
              </button>
            </div>
            <div className="modal_content">
              {modal.type == "following" ? (
                <section className="user_list">
                  {userFollowing.length > 0 ? (
                    userFollowing.map((u, index) => (
                      <div key={index} className="user-card">
                        <Link href={`/u/${u.username}`}>
                          <img
                            src={
                              u.photoURL ||
                              `https://eu.ui-avatars.com/api/?name=${u?.username.replace("-", "+").replace(".", "+").replace("_", "+")}`
                            }
                            alt={`${u.username}'s avatar`}
                          />
                          <span>{u.username}</span>
                        </Link>
                      </div>
                    ))
                  ) : isOwnProfile ? (
                    <p>Você ainda não segue ninguém</p>
                  ) : (
                    <p>Este usuário não segue ninguém</p>
                  )}
                </section>
              ) : (
                <section className="user_list">
                  {userFollowers.length > 0 ? (
                    userFollowers.map((u, index) => (
                      <div key={index} className="user-card">
                        <Link href={`/u/${u.username}`}>
                          <img
                            src={
                              u.photoURL ||
                              `https://eu.ui-avatars.com/api/?name=${u?.username.replace("-", "+").replace(".", "+").replace("_", "+")}`
                            }
                            alt={`${u.username}'s avatar`}
                          />
                          <span>{u.username}</span>
                        </Link>
                      </div>
                    ))
                  ) : isOwnProfile ? (
                    <p>Você ainda não possui seguidores</p>
                  ) : (
                    <p>Este usuário não possui seguidores</p>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      )}
      {isOwnProfile && !user.emailVerified && (
        <>
          <div className="alert warning icon">
            <Warning />
            <h4>
              <a href={`/auth/verify-email/?redirect/u/${params.username}/`}>
                Verifique seu email!
              </a>
            </h4>
          </div>
          <br />
        </>
      )}
      <section className="user_info">
        <div className="user_side">
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
            </div>
          </details>

          <ShareMenu
            ref={shareRef}
            text={`Veja o perfil de ${user.username} no text.dev.br!`}
            path={"u/" + user.username}
            side="left"
          />
        </div>
        <div className="user_header">
          <div className="user_header_image">
            <Image
              width={100}
              height={100}
              src={
                user.photoURL ||
                `https://eu.ui-avatars.com/api/?name=${user?.username.replace("-", "+").replace(".", "+").replace("_", "+")}`
              }
              alt="Foto do usuário"
              priority
            />
          </div>
          <div className="user_header_info">
            <h2 className="username">{user.username}</h2>
            <div className="user_header_info_users">
              <button
                className="nostyle"
                onClick={() => setModal({ isOpen: true, type: "followers" })}
              >
                {formatNumber(userFollowers?.length || 0)} seguidores
              </button>
              <button
                className="nostyle"
                onClick={() => setModal({ isOpen: true, type: "following" })}
              >
                {formatNumber(userFollowing?.length || 0)} seguindo
              </button>
            </div>
          </div>
        </div>
        <div className="user_footer">
          {user.description && (
            <div
              className="user_footer_desc"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          <div className="user_footer_links">
            <div className="user_footer_links_social">
              {user.website && (
                <>
                  <Link
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn icon"
                  >
                    <GlobeSimple />
                  </Link>
                  <hr className="y" />
                </>
              )}
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
          <div className="user_footer_follow">
            {!isOwnProfile && loggedUser && (
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
            )}
          </div>
        </div>
      </section>
      <hr />
      {isOwnProfile && (
        <section className="tabs four">
          <button
            className={`icon-label ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Circle />
            <span>
              Todos
              {posts.length > 0 && (
                <small className="gray">{posts.length}</small>
              )}
            </span>
          </button>
          <button
            className={`icon-label ${activeTab === "published" ? "active" : ""}`}
            onClick={() => setActiveTab("published")}
          >
            <CardsThree />
            <span>
              Publicados
              {posts
                .filter((p) => p.type == "post")
                .filter((p) => p.isDraft == false).length > 0 && (
                <small className="gray">
                  {
                    posts
                      .filter((p) => p.type == "post")
                      .filter((p) => p.isDraft == false).length
                  }
                </small>
              )}
            </span>
          </button>
          <button
            className={`icon-label ${activeTab === "replies" ? "active" : ""}`}
            onClick={() => setActiveTab("replies")}
          >
            <ChatTeardrop />
            <span>
              Comentários
              {posts.filter((p) => p.type == "reply").length > 0 && (
                <small className="gray">
                  {posts.filter((p) => p.type == "reply").length}
                </small>
              )}
            </span>
          </button>
          <button
            className={`icon-label ${activeTab === "drafts" ? "active" : ""}`}
            onClick={() => setActiveTab("drafts")}
          >
            <FileDashed />
            <span>
              Rascunhos
              {posts
                .filter((p) => p.type == "post")
                .filter((p) => p.isDraft == true).length > 0 && (
                <small className="gray">
                  {
                    posts
                      .filter((p) => p.type == "post")
                      .filter((p) => p.isDraft == true).length
                  }
                </small>
              )}
            </span>
          </button>
        </section>
      )}
      <section className="list">{renderPosts(posts)}</section>
    </>
  );
}
