"use client";
import { auth, db } from "@/firebase";
import {
  CheckSquare,
  Eye,
  FacebookLogo,
  GithubLogo,
  GlobeSimple,
  InstagramLogo,
  Link,
  ListBullets,
  ListNumbers,
  Pencil,
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
  WhatsappLogo,
} from "@phosphor-icons/react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { marked } from "marked";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const handleSave = async (
  user,
  description,
  website,
  username,
  photoURL,
  social,
  router
) => {
  if (user) {
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
      router.push(`/u/${user.username}`);
    } catch (error) {
      toast.error("Erro ao atualizar perfil.");
      console.error("Erro ao atualizar perfil:", error);
    }
  }
};

const handleFileUpload = async (e, user, setPhotoURL) => {
  if (!user || !user.uid) {
    toast.error("Usuário não autenticado. Faça login novamente.");
    return;
  }

  const file = e.target.files[0];
  if (!file) return;

  const storage = getStorage();
  const storageRef = ref(storage, `user_photos/${user.uid}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    () => {},
    (error) => {
      toast.error("Erro ao fazer upload da imagem.");
      console.error("Erro ao fazer upload da imagem:", error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      setPhotoURL(downloadURL);
      toast.success("Imagem de perfil atualizada com sucesso!");
    }
  );
};

export default function ProfileEdit() {
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
    whatsapp: "",
  });
  const [tabIsPreview, setTabIsPreview] = useState(false);
  const headingRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    document.title = "Editar meu perfil - text.dev.br";

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
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  } else {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        toast.error("Usuário não autenticado. Faça login novamente.");
        router.push("/auth/login");
      }
    });
  }
}, [router]);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", parsedUser.uid));
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
    } else {
      toast.error("Usuário não encontrado. Faça login novamente.");
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <>
      <h1>Editar Perfil</h1>
      <section className="form">
        <h3>Foto de perfil</h3>
        <div className="profile_img">
          {photoURL && (
            <Image
              src={photoURL}
              width={120}
              height={120}
              quality={100}
              alt="Foto de perfil"
              className="profile-img"
            />
          )}
          <div className="profile_img_input">
            <label htmlFor="photo">
              Upload
              <UploadSimple />
            </label>
            <input
              accept="image/*"
              id="photo"
              type="file"
              onChange={(e)=>handleFileUpload(e, user, setPhotoURL)}
            />
          </div>
        </div>

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
          <div className="input">
            <a
              href={"https://github.com/" + social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
              disabled={!social.github}
            >
              <GithubLogo />
            </a>
            <input
              type="text"
              id="github"
              value={social.github}
              onChange={(e) =>
                setSocial({
                  ...social,
                  github: e.target.value,
                })
              }
              placeholder="GitHub"
            />
          </div>
          <div className="input">
            <a
              href={"https://instagram.com/" + social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
              disabled={!social.instagram}
            >
              <InstagramLogo />
            </a>
            <input
              type="text"
              id="instagram"
              value={social.instagram}
              onChange={(e) =>
                setSocial({
                  ...social,
                  instagram: e.target.value,
                })
              }
              placeholder="Instagram"
            />
          </div>
          <div className="input">
            <a
              href={"https://facebook.com/" + social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
              disabled={social.facebook ? false : true}
            >
              <FacebookLogo />
            </a>
            <input
              type="text"
              id="facebook"
              value={social.facebook}
              onChange={(e) =>
                setSocial({
                  ...social,
                  facebook: e.target.value,
                })
              }
              placeholder="Facebook"
            />
          </div>
          <div className="input">
            <a
              href={"https://x.com/" + social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
            >
              <TwitterLogo />
            </a>
            <input
              type="text"
              id="twitter"
              value={social.twitter}
              onChange={(e) =>
                setSocial({
                  ...social,
                  twitter: e.target.value,
                })
              }
              placeholder="Twitter"
            />
          </div>
          <div className="input">
            <a
              href={"https://threads.net/@" + social.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
            >
              <ThreadsLogo />
            </a>
            <input
              type="text"
              id="threads"
              value={social.threads}
              onChange={(e) =>
                setSocial({
                  ...social,
                  threads: e.target.value,
                })
              }
              placeholder="Threads"
            />
          </div>
          <div className="input">
            <a
              href={"https://wa.me/" + social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn icon"
            >
              <WhatsappLogo />
            </a>
            <input
              type="text"
              id="whatsapp"
              value={social.whatsapp}
              onChange={(e) =>
                setSocial({
                  ...social,
                  whatsapp: e.target.value,
                })
              }
              placeholder="WhatsApp"
            />
          </div>
        </div>

        <div className="buttons">
          <a href="/" className="btn">
            Cancelar
          </a>
          <button
            onClick={() =>
              handleSave(
                user,
                description,
                website,
                username,
                photoURL,
                social,
                router
              )
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