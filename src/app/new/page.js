"use client";
import ContentForm from "@/(components)/ContentForm";
import { auth, db } from "@/firebase";
import {
  BracketsCurly,
  Code,
  Eye,
  Image,
  Link,
  ListBullets,
  ListNumbers,
  PencilSimple,
  Quotes,
  Table,
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
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
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
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const New = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [user, setUser] = useState(null);
  const [tabIsPreview, setTabIsPreview] = useState(false);
  const router = useRouter();
  const headingRef = useRef(null);

  const renderer = new marked.Renderer();

  useEffect(() => {
    document.title = "Criar nova postagem - text.dev.br";

    const handleClickOutside = (event) => {
      if (headingRef.current && !headingRef.current.contains(event.target)) {
        headingRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.title = "Criar nova postagem - text.dev.br";

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const tempUser = userDocSnap.data();
          setUser({ ...tempUser, uid: u.uid });
        }
      } else {
        router.push("/auth/login");
        toast.error("Faça login para criar uma postagem.");
      }
    });

    setInterval(() => {
      return () => unsubscribe();
    }, 10000);
  }, [router, user]);

  const handleSubmit = async (isDraft = false) => {
    if (!user) {
      toast.error("Você precisa fazer login para criar uma postagem!");
      router.push("/auth/login/?return=/new");
      return;
    }

    if (!title || !content) {
      toast.error("Preencha os campos de título e conteúdo!");
      return;
    }
    if (!isDraft && content.trim().split(" ").length < 200) {
      toast.error("O conteúdo precisa ter mais de 200 palavras!");
      return;
    }

    try {
      const postRef = collection(db, "posts");
      const postId = doc(postRef).id; // Gera o ID único

      const newPost = {
        title,
        titleLowerCase: title.toLowerCase(),
        content,
        source: source || null,
        author: user.uid,
        date: new Date(),
        path: strFormat(title),
        id: postId, // Usa o ID gerado
        likes: 0,
        replies: [],
        isDraft, // Adiciona a propriedade isDraft
        type: "post",
      };

      await setDoc(doc(postRef, postId), newPost);

      toast.success(
        isDraft ? "Rascunho salvo com sucesso!" : "Postagem criada com sucesso!"
      );
      router.push(`/${user.username}/${newPost.path}`);
    } catch (error) {
      console.error("Erro ao criar a postagem:", error);
      toast.error("Erro ao criar a postagem.");
    }
  };

  const strFormat = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\s+/g, "-") // Substitui espaços por hífens
      .toLowerCase()
      .replace(/[?!°,.#;_]/g, "") // Remove caracteres especiais indesejados
      .replace(/--+/g, "-") // Substitui múltiplos hífens por um único hífen
      .replace(/\.\.+/g, "-") // Substitui múltiplos pontos por um hífen
      .replace(/__+/g, "-") // Substitui múltiplos underlines por um hífen
      .replace(/[^\x00-\x7F]/g, "") // Remove caracteres não-ASCII (como emojis)
      .replace(":", "-"); // Substitui dois-pontos por hífen
  };
  
  return (
    <>
      <h1>Nova postagem</h1>
      <div className="alert">
        <p>Olá, escritor(a) 👋!</p>
        <p>
          Para manter nossa comunidade organizada 🗃️ e com conteúdos relevantes,
          faça questão de ler o <a href="/code-of-conduct">Código de Conduta</a>{" "}
          📄.
        </p>
      </div>
      <section className="form">
        <div className="input">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da postagem"
            required
          />
        </div>

        <div className="content_input">
          <label htmlFor="content">Conteúdo</label>

          <ContentForm
            content={content}
            setContent={setContent}
            tabIsPreview={tabIsPreview}
            setTabIsPreview={setTabIsPreview}
            headingRef={headingRef}
            type="post"
          />
          <small
            className={
              content.trim().split(" ").length < 200 ? "danger" : "success"
            }
          >
            {content.trim().split(" ").length}/200
          </small>
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

        <hr />
        <div className="buttons">
          <button onClick={() => handleSubmit(true)}>Salvar rascunho</button>
          <button onClick={() => handleSubmit(false)} className="active">
            Publicar
          </button>
        </div>
      </section>
    </>
  );
};

export default New;
