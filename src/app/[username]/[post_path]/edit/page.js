"use client";
import { auth, db } from "@/firebase";
import {
  BracketsCurly,
  CheckSquare,
  Code,
  Image,
  Link,
  ListBullets,
  ListNumbers,
  Pencil,
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
  Eye,
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import hljs from "highlight.js";
import { marked } from "marked";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const EditPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [tabIsPreview, setTabIsPreview] = useState(false);
  const router = useRouter();
  const { username, post_path } = useParams();
  const headingRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headingRef.current && !headingRef.current.contains(event.target)) {
        headingRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const renderer = new marked.Renderer();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data());
        } else {
          const userData = {
            description: "",
            email: u.email,
            emailVerified: u.emailVerified,
            joinedAt: Timestamp.now(),
            name: u.displayName,
            username: formatUsername(u.displayName),
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
            github: "",
            savedPosts: [],
          };
          await setDoc(userDocRef, userData);
          setUser(userData);
        }
      } else {
        setUser(null);
        toast.error("Você precisa fazer login para editar uma postagem!");
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchPost = async () => {
        try {
          const postDocQuery = query(
            collection(db, "posts"),
            where("path", "==", post_path)
          );
          const postDocSnap = (await getDocs(postDocQuery)).docs[0];
          if (postDocSnap.exists()) {
            const postData = postDocSnap.data();
            if (postData.author === user.uid) {
              setPost(postData);
              setTitle(postData.title);
              setContent(postData.content);
              setSource(postData.source || "");
            } else {
              toast.error("Você não tem permissão para editar esta postagem.");
              router.push(`/${username}/${post_path}`);
            }
          } else {
            toast.error("Postagem não encontrada.");
            router.push("/");
          }
        } catch (error) {
          console.error("Erro ao carregar a postagem:", error);
          toast.error("Erro ao carregar a postagem.");
        }
      };

      fetchPost();
    }
  }, [user, post_path, router]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa fazer login para editar esta postagem!");
      router.push(`/auth/login/?return=/${username}/${post_path}/edit`);
      return;
    }

    if (!title || !content) {
      toast.error("Preencha os campos de título e conteúdo!");
      return;
    }

    try {
      const postQuery = query(
        collection(db, "posts"),
        where("path", "==", post_path)
      );
      const postRef = (await getDocs(postQuery)).docs[0].ref;
      await updateDoc(postRef, {
        title,
        content,
        source: source || null,
        date: new Date(),
      });

      toast.success("Postagem atualizada com sucesso!");
      router.push(`/${username}/${post_path}`);
    } catch (error) {
      console.error("Erro ao atualizar a postagem:", error);
      toast.error("Erro ao atualizar a postagem.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "posts", post.id));
      toast.success("Postagem excluída com sucesso!");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const formatUsername = (name) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[!?°,°#]/g, "");
  };

  renderer.heading = (text, level) => {
    const slug = text.toLowerCase().replace(/\s+/g, "-");
    return `<h${level} id="${slug}">${text}</h${level}>`;
  };

  renderer.list = (body, ordered, start) => {
    if (ordered) {
      return `<ol>${body}</ol>`;
    } else {
      if (body.includes('<input type="checkbox"')) {
        return `<ul class="checklist">${body}</ul>`;
      } else {
        return `<ul>${body}</ul>`;
      }
    }
  };

  renderer.listitem = (text, task, checked) => {
    if (task) {
      return `<li><input type="checkbox" disabled ${checked ? "checked" : ""} value="${text}"/></li>`;
    }
    return `<li>${text}</li>`;
  };

  renderer.codespan = (code) => `<p><code>${code}</code></p>`;
  renderer.code = (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    const highlighted = hljs.highlight(code, { language: validLanguage }).value;
    return `<pre><code class="hljs ${validLanguage}">${highlighted}</code></pre>`;
  };

  renderer.image = (href, text) => {
    return `
      <figure>
        <img src="${href}" alt="${text}" />
        <figcaption>${text}</figcaption>
      </figure>
    `;
  };

  marked.setOptions({
    renderer,
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  if (!post) return <div>Carregando...</div>;

  return (
    <>
      <h1>Editar postagem</h1>
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
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da postagem"
          />
        </div>
        <div className="content_input">
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
                  onClick={() => setContent(content + "\n```js\n```")}
                  title="Código em bloco"
                >
                  <BracketsCurly />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n- item 1\n- item 2\n- item 3")
                  }
                  title="Lista não ordenada"
                >
                  <ListBullets />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n1. item 1\n2. item 2\n3. item 3")
                  }
                  title="Lista ordenada"
                >
                  <ListNumbers />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n- [ ] item\n- [x] item")
                  }
                  title="Caixa de seleção"
                >
                  <CheckSquare />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n| Tabela | |\n| ----- | |\n| | |\n")
                  }
                  title="Tabela"
                >
                  <Table />
                </button>
                <button
                  className="icon"
                  onClick={() =>
                    setContent(content + "\n![descrição](url da imagem)\n")
                  }
                  title="Imagem"
                >
                  <Image />
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
                dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
              ></div>
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Conteúdo"
                minLength={800}
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
        <hr />
        <div className="buttons">
          <a href={`/${username}/${post_path}`} className="btn">
            Cancelar
          </a>
          <button onClick={handleSubmit} className="active">
            Atualizar
          </button>
        </div>
        <hr />
        <button className="danger" onClick={() => handleDelete()}>
          Deletar postagem
        </button>
      </section>
    </>
  );
};

export default EditPost;
