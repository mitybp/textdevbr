"use client";

import { auth, db } from "@/firebase";
import {
  AmazonLogo,
  AndroidLogo,
  AppWindow,
  ArrowDown,
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
  FileC,
  FileCSharp,
  FileCss,
  FileHtml,
  FileJs,
  FileJsx,
  FilePy,
  FileTs,
  FolderOpen,
  FunnelSimple,
  GitBranch,
  GithubLogo,
  Hexagon,
  LinuxLogo,
  MagnifyingGlass,
  Network,
  Newspaper,
  Robot,
  Rows,
  Shield,
  Steps,
  SuitcaseSimple,
  TagSimple,
  TestTube,
  TextAa,
  Video,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PostCard from "./components/PostCard";
import TagList from "./components/TagList";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsLimit, setPostsLimit] = useState(50);
  const [filterTags, setFilterTags] = useState([]);

  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page"))
    : 1;

  const postsLimitRef = useRef(null);
  const tagsRef = useRef(null);
  const filtersRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [order, currentPage, fetchPosts()]);

  const fetchUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSavedPosts(new Set(userData.savedPosts || []));
        setLikedPosts(new Set(userData.likedPosts || []));
        Cookies.set("user", JSON.stringify(userData), { expires: 7 });
      }
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const fetchPosts = async (page = 1, psLimit = 50) => {
    setLoading(true);
    try {
      const q = buildPostsQuery(psLimit);
      const querySnapshot = await getDocs(getPaginatedQuery(q, page));
      const fetchedPosts = await mapPosts(querySnapshot);
      setPosts(fetchedPosts);

      const totalSnapshot = await getDocs(collection(db, "posts"));
      setTotalPosts(totalSnapshot.size);
    } catch (error) {
      toast.error("Erro ao buscar postagens!");
      console.error("Erro ao buscar postagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildPostsQuery = (psLimit) => {
    if (filterTags.length === 0) {
      return query(
        collection(db, "posts"),
        orderBy("date", order),
        limit(psLimit)
      );
    } else {
      return query(
        collection(db, "posts"),
        where("tags", "array-contains-any", filterTags),
        orderBy("date", order),
        limit(psLimit)
      );
    }
  };

  const getPaginatedQuery = (q, page) => {
    if (page > 1 && posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      const lastPostDoc = doc(db, "posts", lastPost.id);
      return query(q, startAfter(lastPostDoc));
    }
    return q;
  };

  const mapPosts = async (querySnapshot) => {
    const tempPosts = [];
    for (const post of querySnapshot.docs) {
      const postData = post.data();
      const authorData = await fetchAuthorData(postData.author);
      tempPosts.push({ ...postData, id: post.id, author: authorData });
    }
    return tempPosts;
  };

  const fetchAuthorData = async (authorUid) => {
    try {
      const authorDoc = await getDoc(doc(db, "users", authorUid));
      if (authorDoc.exists()) {
        const authorData = authorDoc.data();
        return {
          username: authorData.username || "Desconhecido",
          name: authorData.name || "Nome não fornecido",
          uid: authorData.uid,
          photoURL:
            authorData.photoURL ||
            `https://eu.ui-avatars.com/api/?name=${authorData.name.replaceAll(" ", "+")}&size=250`,
        };
      }
      return {};
    } catch (error) {
      console.error("Erro ao buscar dados do autor:", error);
      return {}; // Retorna um objeto vazio em caso de erro
    }
  };

  const handleSearch = async () => {
    if (searchTerm) {
      await searchPosts();
    } else {
      await fetchPosts();
    }
  };

  const searchPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "posts"),
        orderBy("titleLowerCase"),
        startAt(searchTerm.toLowerCase()),
        endAt(searchTerm.toLowerCase() + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const searchedPosts = await mapPosts(querySnapshot);
      setPosts(searchedPosts);
    } catch (error) {
      toast.error("Erro ao buscar postagens!");
      console.error("Erro ao buscar postagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setFilterTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filterTagsValues = [
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

  const orderedTags = filterTagsValues.sort((a, b) =>
    filterTags.includes(a.name) && !filterTags.includes(b.name) ? -1 : 1
  );

  return (
    <>
      <section className="search">
        <input
          type="text"
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} className="icon">
          <MagnifyingGlass />
        </button>
        <details className="md" ref={filtersRef}>
          <summary>
            <FunnelSimple />
          </summary>
          <div className="left">
            <button
              onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
              className="icon-label"
            >
              Mais {order === "asc" ? "antigo" : "novo"}
              <ArrowDown style={{ rotate: order === "asc" ? 0 : 180 }} />
            </button>
            <details className="md" ref={postsLimitRef}>
              <summary className="icon-label">
                N° de postagens
                <Rows />
              </summary>
              <div className="inside">
                {[10, 25, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPostsLimit(n)}
                    disabled={n === postsLimit}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </details>
            <TagList
              tagsRef={tagsRef}
              tags={filterTagsValues}
              selectedTags={filterTags}
              onToggleTag={toggleTag}
            />
          </div>
        </details>
      </section>
      <div className="posts">
        {loading && <p>Carregando...</p>}
        {!loading && posts.length === 0 && <p>Nenhum post encontrado</p>}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={post.author}
            liked={likedPosts}
            saved={savedPosts}
            setLikedPosts={setLikedPosts}
            setSavedPosts={setSavedPosts}
          />
        ))}
      </div>
    </>
  );
}
