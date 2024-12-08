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
  Eye,
  Trash,
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
        let userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          let userData = userDoc.data();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        setUser(null);
        router.push(`/auth/login?redirect=/u/${username}/${post_path}/edit`);
        toast.error("Você precisa entrar para editar a postagem!");
      }
    });

    setInterval(() => {
      return () => unsubscribe();
    }, 10000);
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
              router.push(`/u/${username}/${post_path}`);
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
  }, [user, username, post_path, router]);

  const handleSubmit = async (isDraft) => {
    if (!user) {
      toast.error("Você precisa fazer login para editar esta postagem!");
      router.push(`/auth/login/?return=/u/${username}/${post_path}/edit`);
      return;
    }

    if (isDraft) {
      if (!title) {
        toast.error("Preencha o campo de título!");
        return;
      }
    } else {
      if (!title || !content) {
        toast.error("Preencha os campos de título e conteúdo!");
        return;
      }
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
        isDraft,
        path: formatUsername(title),
      });

      toast.success(
        isDraft
          ? "Rascunho salvo com sucesso!"
          : "Postagem atualizada com sucesso!"
      );
      router.push(`/u/${username}/${formatUsername(title)}`);
    } catch (error) {
      console.error("Erro ao atualizar a postagem:", error);
      toast.error("Erro ao atualizar a postagem.");
    }
  };

  const handleDelete = async () => {
    try {
      if (post.type === "post") {
        // Se for uma postagem, delete todos os comentários relacionados a essa postagem.
        const repliesQuery = query(
          collection(db, "replies"),
          where("parent", "==", ["post", post.id])
        );
        const repliesSnapshot = await getDocs(repliesQuery);

        // Excluir todos os comentários relacionados
        const deleteRepliesPromises = repliesSnapshot.docs.map((replyDoc) =>
          deleteDoc(replyDoc.ref)
        );
        await Promise.all(deleteRepliesPromises);

        // Deletar a postagem após excluir os comentários
        await deleteDoc(doc(db, "posts", post.id));
        toast.success("Postagem e comentários excluídos com sucesso!");
      } else if (post.type === "comment") {
        // Se for um comentário, apenas remova o ID do comentário do array de replies
        const parentPostRef = doc(db, "posts", post.parent[1]);
        const parentPostDoc = await getDoc(parentPostRef);

        if (parentPostDoc.exists()) {
          const parentPostData = parentPostDoc.data();
          const updatedReplies = parentPostData.replies.filter(
            (replyId) => replyId !== post.id
          );

          // Atualize a postagem com a lista de replies modificada
          await updateDoc(parentPostRef, {
            replies: updatedReplies,
          });
          toast.success("Comentário excluído com sucesso!");
        }
      }
      router.push(`/u/${username}/${post_path}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir a postagem ou comentário.");
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
    breaks: true,
    gfm: true,
    sanitize: true,
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  if (!post) {
    return (
      <div className="loader">
        <span className="object"></span>
      </div>
    );
  }

  return (
    <>
      <h1>Editar postagem</h1>
      <div className="alert">
        <p>Olá, escritor(a) 👋!</p>
        <p>
          Para manter nossa comunidade organizada 🗃️ e com conteúdos relevantes,
          faça questão de ler o <a href="/code-of-conduct">Código de Conduta</a>{" "}
          📄 e o{" "}
          <a href="/u/dimitri.pusch/manual-de-postagem">Manual de Postagem</a>.
        </p>
        <p>Obrigado e boa postagem!</p>
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
                  <PencilSimple />
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
            <Link
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documentação
            </Link>
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
          {post.isDraft ? (
            <button onClick={() => handleSubmit(true)}>Salvar rascunho</button>
          ) : (
            <Link href={`/${username}/${post_path}`} className="btn">
              Cancelar
            </Link>
          )}
          <button onClick={() => handleSubmit(false)} className="active">
            {post.isDraft ? "Publicar" : "Atualizar"}
          </button>
        </div>
        <hr />
        <button className="icon-label danger" onClick={() => handleDelete()}>
          Deletar
          <Trash />
        </button>
      </section>
    </>
  );
};

export default EditPost;
