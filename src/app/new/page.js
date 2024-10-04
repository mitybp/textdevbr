"use client";
import { auth, db } from "@/firebase";
import {
  AmazonLogo,
  AndroidLogo,
  AppWindow,
  ArrowUpRight,
  BracketsCurly,
  Brain,
  Chats,
  Cloud,
  Code,
  Database,
  Desktop,
  DeviceMobile,
  DotOutline,
  Eye,
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
  Hexagon,
  Image,
  Link,
  LinuxLogo,
  ListBullets,
  ListNumbers,
  Network,
  Newspaper,
  Quotes,
  Robot,
  Shield,
  Steps,
  SuitcaseSimple,
  Table,
  TestTube,
  TextAa,
  TextB,
  TextH,
  TextHFive,
  TextHFour,
  TextHOne,
  TextHSix,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  Video,
  Coffee,
  TagSimple,
  Pencil,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import hljs from "highlight.js";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const New = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [user, setUser] = useState(null);
  const [tabIsPreview, setTabIsPreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const router = useRouter();
  const headingRef = useRef(null);
  const tagsRef = useRef(null);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
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

  const orderedTags = [...tagsValues].sort((a, b) => {
    if (selectedTags.includes(a.name) && !selectedTags.includes(b.name))
      return -1;
    if (!selectedTags.includes(a.name) && selectedTags.includes(b.name))
      return 1;
    return tagsValues.indexOf(a) - tagsValues.indexOf(b);
  });

  const renderer = new marked.Renderer();

  useEffect(() => {
    document.title = "Criar nova postagem - text.dev.br";

    const handleClickOutside = (event) => {
      if (headingRef.current && !headingRef.current.contains(event.target)) {
        headingRef.current.removeAttribute("open");
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
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userDocSnap = await getDoc(userDocRef);

        let temp_user = null;

        if (userDocSnap.exists()) {
          temp_user = userDocSnap.data();
          setUser(temp_user);
        } else {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            name: u.displayName,
            username: user.username,
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
            social: {
              github: "",
              instagram: "",
              facebook: "",
              twitter: "",
              threads: "",
              whatsapp: "",
            },
            savedPosts: [],
          };

          await setDoc(userDocRef, userData);
          temp_user = userData;
          setUser(temp_user);
        }
      } else {
        router.push("/auth/login");
        toast.error("Faça login para criar uma postagem.");
      }
    });

    return () => unsubscribe();
  }, [router, user]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa fazer login para criar uma postagem!");
      router.push("/auth/login/?return=/new");
      return;
    }

    if (!title || !content) {
      toast.error("Preencha os campos de título e conteúdo!");
      return;
    }

    try {
      const postRef = collection(db, "posts");
      const newPost = {
        title,
        titleLowerCase: title.toLowerCase(),
        content,
        source: source || null,
        author: user.uid,
        date: new Date(),
        tags: selectedTags,
        path: strFormat(title),
        id: doc(postRef).id,
        likes: 0,
        comments: []
      };

      await addDoc(postRef, newPost);
      toast.success("Postagem criada com sucesso!");
      router.push(`/${user.username}/${newPost.path}`);
    } catch (error) {
      console.error("Erro ao criar a postagem:", error);
      toast.error("Erro ao criar a postagem.");
    }
  };

  const strFormat = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[?!°,.#]/g, "")
      .replace(/--+/g, "-");
  };

  renderer.heading = (text, level) => {
    const slug = text.toLowerCase().replace(/\s+/g, "-");
    return `<h${level} id="${slug}">${text}</h${level}>`;
  };

  marked.setOptions({
    renderer,
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  return (
    <>
      <h1>Nova postagem</h1>
      <div className="alert">
        <small>
          Para manter nossa comunidade organizada, com conteúdos relevantes e
          interessantes para todos, faça questão de{" "}
          <a href="/dimitri.pusch/manual-de-postagem/">
            ler esta postagem antes
          </a>
          .
        </small>
      </div>
      <section className="form">
        <div className="input">
          <label htmlFor="title">Título*</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da postagem"
          />
        </div>

        <div className="input">
          <label htmlFor="tags">Tags</label>
          <details className="md" ref={tagsRef}>
            <summary className="icon-label">
              Tags {selectedTags.length != 0 && "(" + selectedTags.length + ")"}
              <TagSimple />
            </summary>
            <div className="inside tags">
              {orderedTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => toggleTag(tag.name)}
                  className={`icon-label pill ${selectedTags.includes(tag.name) ? "active" : ""}`}
                >
                  {tag.icon} {tag.name}
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="content_input">
          <label htmlFor="content">Conteúdo*</label>
          <div className="content_input_styles_textarea">
            <div className="content_input_styles">
              <div className="content_input_styles_buttons">
                <details className="md" ref={headingRef}>
                  <summary title="Títulos">
                    <TextH />
                  </summary>
                  <div>
                    <button
                      className="icon-label"
                      onClick={() => setContent(content + "# ")}
                    >
                      Título 1
                      <TextHOne />
                    </button>
                    <button
                      className="icon-label"
                      onClick={() => setContent(content + "## ")}
                    >
                      Título 2
                      <TextHTwo />
                    </button>
                    <button
                      className="icon-label"
                      onClick={() => setContent(content + "### ")}
                    >
                      Título 3
                      <TextHThree />
                    </button>
                    <button
                      className="icon-label"
                      onClick={() => setContent(content + "#### ")}
                    >
                      Título 4
                      <TextHFour />
                    </button>
                    <button
                      className="icon-label"
                      onClick={() => setContent(content + "##### ")}
                    >
                      Título 5
                      <TextHFive />
                    </button>
                    <button
                      className="icon-label"
                      onClick={() => setContent(content + "###### ")}
                    >
                      Título 6
                      <TextHSix />
                    </button>
                  </div>
                </details>
                <button
                  className="icon"
                  onClick={() => setContent(content + "**texto** ")}
                  title="Negrito"
                >
                  <TextB />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "*texto* ")}
                  title="Itálico"
                >
                  <TextItalic />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "~~texto~~ ")}
                  title="Tachado"
                >
                  <TextStrikethrough />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "\n> ")}
                  title="Citação"
                >
                  <Quotes />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(
                      content + "[texto exibido](https://text.dev.br/)"
                    )
                  }
                  title="Link"
                >
                  <Link />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "``")}
                  title="Código em linha"
                >
                  <Code />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "```\n\n```")}
                  title="Código"
                >
                  <BracketsCurly />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "![texto](url)")}
                  title="Imagem"
                >
                  <Image />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "- item")}
                  title="Lista não ordenada"
                >
                  <ListBullets />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "1. item")}
                  title="Lista ordenada"
                >
                  <ListNumbers />
                </button>
                <button
                  className="icon"
                  onClick={() => setContent(content + "|   |")}
                  title="Tabela"
                >
                  <Table />
                </button>
              </div>
              <div className="content_input_styles_slider">
                <button
                  className={`icon ${!tabIsPreview && "active"}`}
                  onClick={() => setTabIsPreview(false)}
                >
                  <Pencil />
                </button>
                <button
                  className={`icon ${tabIsPreview && "active"}`}
                  onClick={() => setTabIsPreview(true)}
                >
                  <Eye />
                </button>
              </div>
            </div>
            {tabIsPreview ? (
              <div
                className="preview"
                dangerouslySetInnerHTML={{ __html: marked(content) }}
              ></div>
            ) : (
              <textarea
                id="content"
                placeholder="Escreva o conteúdo da postagem"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            )}
          </div>

          <small>
            Conteúdo em MarkDown.{" "}
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documentação
            </a>
            .
          </small>
        </div>

        <div className="input">
          <label htmlFor="source">Fonte (opcional)</label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="https://website.com/"
          />
        </div>
        <small>Os campos marcados com asterísco (*) são obrigatórios.</small>
        <hr />
        <div className="buttons">
          <a href="/" className="btn">
            Cancelar
          </a>
          <button onClick={handleSubmit} className="active">
            Postar
          </button>
        </div>
      </section>
    </>
  );
};

export default New;
