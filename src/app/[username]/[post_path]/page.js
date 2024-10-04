"use client";
import CommentCard from "@/components/CommentCard";
import ShareMenu from "@/components/ShareMenu";
import { auth, db } from "@/firebase";
import {
  AmazonLogo,
  AndroidLogo,
  AppWindow,
  ArrowUpRight,
  Brain,
  Chats,
  Cloud,
  Code,
  Coffee,
  Database,
  Desktop,
  DeviceMobile,
  DotOutline,
  DotsThreeVertical,
  FileC,
  FileCSharp,
  FileCss,
  FileHtml,
  FileJs,
  FileJsx,
  FilePy,
  FileTs,
  FolderOpen,
  GitBranch,
  GithubLogo,
  Heart,
  Hexagon,
  LinuxLogo,
  Network,
  Newspaper,
  Pencil,
  Robot,
  Shield,
  Steps,
  SuitcaseSimple,
  TagSimple,
  TestTube,
  TextAa,
  Video,
  Warning,
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
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { marked } from "marked";
import markedAlert from "marked-alert";
import { baseUrl } from "marked-base-url";
import customHeadingId from "marked-custom-heading-id";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
const extendedTables = require("marked-extended-tables");

const PostPage = ({ params }) => {
  const { username, post_path } = params;
  const [user, setUser] = useState(null);
  const [postData, setPostData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [content, setContent] = useState("");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(new Set());

  const menuRef = useRef(null);
  const shareRef = useRef(null);
  const tagsRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        shareRef.current.removeAttribute("open");
      }
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        tagsRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const signIn = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            name: user.displayName,
            username: strFormat(user.displayName),
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
            github: "",
            savedPosts: [],
          };
          await setDoc(docRef, userData);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    });

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

        setLikes(postData.likes);
        setPostData({ ...postData, id: postId });
        setAuthorData(authorData);

        if (postData.comments && Array.isArray(postData.comments)) {
          const temp_comms = await Promise.all(
            postData.comments.map(async (comm) => {
              const commDoc = await getDoc(doc(db, "comments", comm.id));
              const commData = commDoc.data();
              return { ...commData };
            })
          );
          setComments(temp_comms);
        }

        marked.use([
          markedAlert(),
          baseUrl("https://text.dev.br/"),
          customHeadingId(),
          extendedTables,
        ]);
        let md = marked.parse(postData.content || "", {
          gfm: true,
          breaks: true,
        });
        setContent(md);
      }
    };
    fetchPostData();

    return () => signIn();
  }, [user, username, post_path, router]);

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

  const handleCommentSubmit = async () => {
    try {
      const commentData = {
        author: {
          username: user.username,
          name: user.name,
        },
        content: comment,
        _id: doc(collection(db, "comments")).id,
        date: Timestamp.now(),
        postId: postData.path,
        comments: [],
      };

      await setDoc(doc(db, "comments", commentData._id), commentData);
      await updateDoc(doc(db, "posts", postData.id), {
        comments: arrayUnion(commentData._id),
      });
      router.push(`/${username}/${post_path}/comments/${commentData._id}`);
      toast.success("Comentário enviado!");
    } catch (error) {
      toast.error("Erro ao enviar o comentário!");
      console.error("Erro ao enviar o comentário: ", error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const postRef = doc(db, "posts", postId);

      await updateDoc(postRef, {
        likes: increment(likedPosts.has(postId) ? -1 : 1),
      });

      setLikes((prevLikes) => prevLikes + (likedPosts.has(postId) ? -1 : 1));

      if (likedPosts.has(postId)) {
        setLikedPosts((prev) => {
          const updated = new Set(prev);
          updated.delete(postId);
          return updated;
        });
        await updateDoc(userRef, { likedPosts: arrayRemove(postId) });
        toast.success("Postagem descurtido!");
      } else {
        setLikedPosts((prev) => new Set(prev).add(postId));
        await updateDoc(userRef, { likedPosts: arrayUnion(postId) });
        toast.success("Postagem curtida!");
      }
    } catch (error) {
      toast.error("Erro ao curtir/descurtir a postagem!");
      console.error(error);
    }
  };

  const tagsValues = [
    { name: "webdev", icon: <Desktop /> },
    { name: "js", icon: <FileJs /> },
    { name: "beginners", icon: <Steps /> },
    { name: "tutorial", icon: <Video /> },
    { name: "react", icon: <FileJsx /> },
    { name: "python", icon: <FilePy /> },
    { name: "ai", icon: <Robot /> },
    { name: "productivity", icon: <ArrowUpRight /> },
    { name: "opensource", icon: <FolderOpen /> },
    { name: "aws", icon: <AmazonLogo /> },
    { name: "css", icon: <FileCss /> },
    { name: "node", icon: <Hexagon /> },
    { name: "java", icon: <Coffee /> },
    { name: "learning", icon: <Brain /> },
    { name: "typescript", icon: <FileTs /> },
    { name: "news", icon: <Newspaper /> },
    { name: "career", icon: <SuitcaseSimple /> },
    { name: "db", icon: <Database /> },
    { name: "discuss", icon: <Chats /> },
    { name: "android", icon: <AndroidLogo /> },
    { name: "dotnet", icon: <DotOutline /> },
    { name: "cloud", icon: <Cloud /> },
    { name: "html", icon: <FileHtml /> },
    { name: "security", icon: <Shield /> },
    { name: "frontend", icon: <TextAa /> },
    { name: "backend", icon: <Code /> },
    { name: "github", icon: <GithubLogo /> },
    { name: "testing", icon: <TestTube /> },
    { name: "csharp", icon: <FileCSharp /> },
    { name: "c", icon: <FileC /> },
    { name: "api", icon: <Network /> },
    { name: "mobile", icon: <DeviceMobile /> },
    { name: "app", icon: <AppWindow /> },
    { name: "linux", icon: <LinuxLogo /> },
    { name: "git", icon: <GitBranch /> },
  ];

  if (!postData || !authorData) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <section className="post_info">
        <div className="post_header">
          <div className="post_header_info">
            <h1>{postData.title}</h1>
            <p>
              <a href={`/${authorData.username}`}>{authorData.username}</a> •{" "}
              {formatTimestamp(postData.date)}
            </p>
            <div className="post_footer">
              <button
                onClick={() => handleLikePost(postData.id)}
                className={`icon-label ${likedPosts.has(postData.id) && "active"}`}
              >
                <Heart
                  weight={likedPosts.has(postData.id) ? "fill" : "regular"}
                />
                {likes}
              </button>
              <ShareMenu
                side="right"
                ref={shareRef}
                text={`Veja a postagem ${postData.title} de ${authorData.name} no text.dev.br!`}
                link={`https://text.dev.br/${username}/${post_path}`}
                qrpath={`${username}/${post_path}`}
              />
              {postData.tags && (
                <details className="md" ref={tagsRef}>
                  <summary className="icon-label">
                    <TagSimple /> {postData.tags.length}
                  </summary>
                  <div className="right tags post">
                    {postData.tags.map((tag) => (
                      <span className="pill" key={tag}>
                        {tagsValues.filter((t) => t.name == tag)[0].icon} {tag}
                      </span>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>

          <div className="post_header_buttons">
            <details className="md" ref={menuRef}>
              <summary>
                <DotsThreeVertical weight="bold" />
              </summary>
              <div className="left">
                {auth.currentUser ? (
                  authorData.name == auth.currentUser.displayName ? (
                    <a
                      href={`/${authorData.username}/${postData.path}/edit`}
                      className="btn icon-label"
                    >
                      Editar postagem <Pencil />
                    </a>
                  ) : (
                    <a
                      href={`/${authorData.username}/${postData.path}/report`}
                      className="btn icon-label danger"
                    >
                      Denunciar
                      <Warning />
                    </a>
                  )
                ) : (
                  <a
                    href={`/${authorData.username}/${postData.path}/report`}
                    className="btn icon-label danger"
                  >
                    Denunciar
                    <Warning />
                  </a>
                )}
              </div>
            </details>
          </div>
        </div>
        <hr />
        <div
          className="post_content"
          dangerouslySetInnerHTML={{ __html: content }}
        ></div>
        {postData.source && (
          <>
            <br />
            <p>
              <b>Fonte: </b>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={postData.source}
              >
                {postData.source.replace(/(^\w+:|^)\/\//, "")}
              </a>
            </p>
          </>
        )}
        <hr />
        <h3>Comentários</h3>
        {Array.from(comments).map((comm) => (
          <CommentCard
            key={comm.id}
            comm={comm}
            username={username}
            post_path={post_path}
          />
        ))}
      </section>
    </>
  );
};

export default PostPage;
