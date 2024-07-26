"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth, googleProvider } from "@/firebase"; // Certifique-se de ter firebase configurado corretamente
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import {
  CheckSquare,
  Code,
  Image,
  Link,
  ListBullets,
  ListNumbers,
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
import { BracketsCurly } from "@phosphor-icons/react/dist/ssr";

const New = () => {
  const [title, setTitle] = useState("");
  let [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [user, setUser] = useState(null);
  let [images, setImages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const signin = onAuthStateChanged(auth, async (u) => {
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
          };
          await setDoc(docRef, userData);
          setUser(userData);
        }
      } else {
        setUser(null);
        toast.error("Você precisa fazer login para criar uma postagem!");
        router.push("/");
      }
    });

    return () => signin();
  }, [router]);

  const handleSubmit = async () => {
    if (user == null) {
      toast.error("Você precisa fazer login para criar uma postagem!");
      await signInWithPopup(auth, googleProvider);
      return;
    } else {
      if (!title || !content) {
        toast.error("Preencha os campos de título e conteúdo!");
      } else {
        try {
          let postRef = doc(collection(db, "posts"));
          const newPost = {
            title,
            content,
            source: source || null,
            author: user.uid,
            date: new Date(),
            path: strFormat(title),
            id: postRef.id,
          };

          await addDoc(collection(db, "posts"), newPost);
          toast.success("Postagem criada com sucesso!");
          router.push(`/${user.username}/${newPost.path}`);
        } catch (error) {
          console.error("Erro ao criar a postagem:", error);
        }
      }
    }
  };

  const strFormat = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll(" ", "-")
      .toLowerCase()
      .replaceAll("?", "")
      .replaceAll("!", "")
      .replaceAll("°", "")
      .replaceAll(",", "")
      .replaceAll(" - ", "-")
      .replaceAll(".", "-")
      .replaceAll("#", "");
  };

  return (
    <>
      <h1>Nova postagem</h1>
      <div className="alert">
        <h3>Importante!</h3>
        <p>
          Para manter nossa comunidade organizada, com conteúdos relevantes e
          interessantes para todos. Faça questão de{" "}
          <a href="/dimitri.pusch/textdevbr-o-espaco-para-desenvolver-livremente/">ler esta postagem antes</a>.
          Obrigado!
        </p>
      </div>
      <section className="form">
        <input
          type="text"
          id="title"
          className="title_input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
        />
        <div className="content_input">
          <section className="md_styles">
            <details className="md">
              <summary title="Títulos">
                <TextH />
              </summary>
              <div>
                <button
                  className="icon-label"
                  onClick={() => {
                    setContent((content += "\n# "));
                    document.getElementsByClassName("md")[0].open = false;
                  }}
                >
                  Título 1
                  <TextHOne />
                </button>
                <button
                  className="icon-label"
                  onClick={() => {
                    setContent((content += "\n## "));
                    document.getElementsByClassName("md")[0].open = false;
                  }}
                >
                  Título 2
                  <TextHTwo />
                </button>
                <button
                  className="icon-label"
                  onClick={() => {
                    setContent((content += "\n### "));
                    document.getElementsByClassName("md")[0].open = false;
                  }}
                >
                  Título 3
                  <TextHThree />
                </button>
                <button
                  className="icon-label"
                  onClick={() => {
                    setContent((content += "\n#### "));
                    document.getElementsByClassName("md")[0].open = false;
                  }}
                >
                  Título 4
                  <TextHFour />
                </button>
                <button
                  className="icon-label"
                  onClick={() => {
                    setContent((content += "\n##### "));
                    document.getElementsByClassName("md")[0].open = false;
                  }}
                >
                  Título 5
                  <TextHFive />
                </button>
                <button
                  className="icon-label"
                  onClick={() => {
                    setContent((content += "\n###### "));
                    document.getElementsByClassName("md")[0].open = false;
                  }}
                >
                  Título 6
                  <TextHSix />
                </button>
              </div>
            </details>
            <button
              className="icon"
              onClick={() => setContent((content += " **texto** "))}
              title="Negrito"
            >
              <TextB />
            </button>
            <button
              className="icon"
              onClick={() => setContent((content += " *texto* "))}
              title="Itálico"
            >
              <TextItalic />
            </button>
            <button
              className="icon"
              onClick={() => setContent((content += " ~~texto~~ "))}
              title="Riscado"
            >
              <TextStrikethrough />
            </button>
            <button
              className="icon"
              onClick={() => setContent((content += "\n> "))}
              title="Citação"
            >
              <Quotes />
            </button>
            <button
              className="icon"
              onClick={() => setContent((content += " [](url) "))}
              title="Link"
            >
              <Link />
            </button>
            <button
              className="icon"
              onClick={() => setContent((content += " `` "))}
              title="Código em linha"
            >
              <Code />
            </button>
            <button
              className="icon"
              onClick={() => setContent((content += "\n```js\n```"))}
              title="Código em bloco"
            >
              <BracketsCurly />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent((content += "\n- item 1\n- item 2\n- item 3"))
              }
              title="Lista não ordenada"
            >
              <ListBullets />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent((content += "\n1. item 1\n2. item 2\n3. item 3"))
              }
              title="Lista ordenada"
            >
              <ListNumbers />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent((content += "\n- [ ] item\n- [x] item"))
              }
              title="Caixa de seleção"
            >
              <CheckSquare />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent((content += "\n| Tabela | |\n| ----- | |\n| | |\n"))
              }
              title="Tabela"
            >
              <Table />
            </button>
            <button
              className="icon"
              onClick={() =>
                setContent((content += "\n![descrição](url da imagem)\n"))
              }
              title="Imagem"
            >
              <Image />
            </button>
          </section>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conteúdo"
            minLength={800}
          ></textarea>
          <small>
            Conteúdo em MarkDown.{" "}
            <a
              href="https://docs.github.com/pt/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documentação
            </a>
            .
          </small>
        </div>
        <div>
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
          <a href="/" className="btn">
            Cancelar
          </a>
          <button onClick={() => handleSubmit()} className="active">
            Postar
          </button>
        </div>
      </section>
    </>
  );
};

export default New;
