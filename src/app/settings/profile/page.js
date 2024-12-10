"use client";

import { uploadFileToGitHub } from "@/(components)/mediaUploader";
import ProfileImageUpload from "@/(components)/ProfileImageUpload";
import { auth, db } from "@/firebase";
import {
  CheckSquare,
  Eye,
  FacebookLogo,
  Gear,
  GithubLogo,
  GlobeSimple,
  InstagramLogo,
  Link,
  LinkedinLogo,
  ListBullets,
  ListNumbers,
  Pencil,
  PencilSimple,
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
  ThreadsLogo,
  TwitterLogo,
  UploadSimple,
} from "@phosphor-icons/react";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { marked } from "marked";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Função para salvar as informações do perfil
const handleSaveProfile = async ({
  user,
  description,
  website,
  username,
  photoURL,
  social,
  router,
}) => {
  if (!user) return;

  try {
    const userDocRef = doc(db, "users", user.uid);

    await updateDoc(userDocRef, {
      description: description.replaceAll("\n", "<br/>"),
      website,
      username,
      photoURL,
      social,
    });

    await updateProfile(auth.currentUser, {
      displayName: username,
      photoURL,
    });

    toast.success("Perfil atualizado com sucesso!");
    router.push(`/${username}`);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    toast.error("Erro ao atualizar perfil.");
  }
};

export default function ProfileEdit() {
  const router = useRouter();
  const headingRef = useRef(null);

  const [user, setUser] = useState(null);
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [social, setSocial] = useState({
    github: "",
    instagram: "",
    facebook: "",
    twitter: "",
    threads: "",
    linkedin: "",
  });
  const [tabIsPreview, setTabIsPreview] = useState(false);

  useEffect(() => {
    document.title = "Editar meu perfil - text.dev.br";

    const handleClickOutside = (event) => {
      if (headingRef.current && !headingRef.current.contains(event.target)) {
        headingRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        toast.error("Usuário não encontrado. Faça login novamente.");
        router.push("/auth/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", storedUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData);
        setDescription(userData.description || "");
        setWebsite(userData.website || "");
        setUsername(userData.username || "");
        setPhotoURL(userData.photoURL || "");
        setSocial(userData.social || {});
      }
    };

    fetchUserData();
  }, [router]);

  return (
    <>
      <section className="tabs top">
        <a href="/settings/profile" className="btn icon-label active">
          <PencilSimple />
          Editar perfil
        </a>
        <a href="/settings/account" className="btn icon-label">
          <Gear />
          Configurações da conta
        </a>
      </section>
      <h1>Editar Perfil</h1>
      <section className="form">
        <h3>Foto de perfil</h3>
        <ProfileImageUpload user={user} />
        <small>* Pode demorar até 1 hora para concluir o upload.</small>

        <h3>Nome de usuário</h3>
        <div className="input">
          <label htmlFor="username">Nome de usuário</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nome de usuário"
          />
        </div>

        <h3>Descrição e website</h3>
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
                dangerouslySetInnerHTML={{
                  __html: marked.parse(description),
                }}
              ></div>
            ) : (
              <textarea
                id="content"
                value={description.replaceAll("<br/>", "\n")}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conteúdo"
                minLength={800}
              ></textarea>
            )}
          </div>
        </div>
        <div>
          <div className="input">
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
              disabled={!website}
            >
              <GlobeSimple />
            </a>
            <input
              type="text"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://seuwebsite.com"
            />
          </div>
        </div>

        <div>
          <h3>Redes sociais</h3>
          {[
            {
              name: "GitHub",
              icon: <GithubLogo />,
              url: "https://github.com/",
            },
            {
              name: "Instagram",
              icon: <InstagramLogo />,
              url: "https://instagram.com/",
            },
            {
              name: "Facebook",
              icon: <FacebookLogo />,
              url: "https://facebook.com/",
            },
            {
              name: "Twitter",
              icon: <TwitterLogo />,
              url: "https://x.com/",
            },
            {
              name: "Threads",
              icon: <ThreadsLogo />,
              url: "https://threads.net/",
            },
            {
              name: "LinkedIn",
              icon: <LinkedinLogo />,
              url: "https://linkedin.com/",
            },
          ].map((s) => (
            <div key={s.name} className="input">
              <a
                href={s.url + social[s.name.toLowerCase()]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn icon"
                disabled={!social[s.name.toLowerCase()]}
              >
                {s.icon}
              </a>
              <input
                type="text"
                id={s.name.toLowerCase()}
                value={social[s.name.toLowerCase()] || ""}
                onChange={(e) =>
                  setSocial({
                    ...social,
                    [s.name.toLowerCase()]: e.target.value,
                  })
                }
                placeholder={s.name}
              />
            </div>
          ))}
        </div>

        <div className="buttons">
          <a href="/" className="btn">
            Cancelar
          </a>
          <button
            onClick={() =>
              handleSaveProfile({
                user,
                description,
                website,
                username,
                photoURL,
                social,
                router,
              })
            }
            className="active"
          >
            Salvar
          </button>
        </div>
      </section>
    </>
  );
}
