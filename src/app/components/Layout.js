"use client";
import { auth, db } from "@/firebase";
import {
  BookmarksSimple,
  Gear,
  Moon,
  Pencil,
  PlusCircle,
  SignIn,
  SignOut,
  Sun,
  User,
  Heart,
} from "@phosphor-icons/react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Layout({ children }) {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Handle theme from cookies
    const savedTheme = Cookies.get("theme");
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.body.classList.add(initialTheme);

    // Handle user authentication state
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
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
          await setDoc(docRef, userData);
          setUser(userData);
          Cookies.set("user", JSON.stringify(userData), { expires: 365 });
        } else {
          const userData = docSnap.data();
          setUser(userData);
          Cookies.set("user", JSON.stringify(userData), { expires: 365 });
        }
      } else {
        setUser(null);
        Cookies.remove("user");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        menuRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365 });
    document.body.classList.remove("light", "dark");
    document.body.classList.add(newTheme);
  };

  const formatUsername = (name) => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[!?°,°#]/g, "");
  };

  return (
    <body className={theme}>
      <Toaster position="top-center" />
      <header>
        <a href="/" className="brand">
          .dev
        </a>
        <div className="links">
          {user ? (
            <>
              <a href="/new" className="btn icon active" title="Nova postagem">
                <PlusCircle />
              </a>
              <hr className="y" />
              <a href="/activity" className="btn icon" title="Minha atividade">
                <Heart />
              </a>
              <details className="md" ref={menuRef}>
                <summary className="user">
                  <Image
                    src={user.photoURL}
                    width={30}
                    height={30}
                    alt="user's photo"
                    sizes="100vw"
                  />
                </summary>
                <div className="left">
                  <a
                    href={`/${user.username}`}
                    className="btn icon-label active"
                  >
                    Meu perfil <User />
                  </a>
                  <a href={`/${user.username}/edit`} className="btn icon-label">
                    Editar perfil <Pencil />
                  </a>
                  <a
                    href={`/${user.username}/settings`}
                    className="btn icon-label"
                  >
                    Configurações <Gear />
                  </a>
                  <button
                    className="icon-label"
                    onClick={toggleTheme}
                    title={`Tema ${theme === "dark" ? "claro" : "escuro"}`}
                  >
                    Mudar o tema {theme === "dark" ? <Sun /> : <Moon />}
                  </button>
                  <hr />
                  <button
                    className="icon-label"
                    onClick={() => {
                      signOut(auth);
                      toast.error("Você saiu da conta!");
                      router.push("/");
                    }}
                    title="Sair"
                  >
                    Sair <SignOut />
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <a
                title="Entrar"
                className="btn icon-label active"
                href="/auth/login"
              >
                <SignIn />
                <span>Entrar</span>
              </a>
              <hr className="y" />
              <button
                className="icon"
                onClick={toggleTheme}
                title={`Tema ${theme === "dark" ? "claro" : "escuro"}`}
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </button>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer>
        <div>
          <span className="brand">.dev</span>
          <p>text.dev.br</p>
        </div>
        <div>
          <p>
            Feito com ❤️ por <a href="/dimitri.pusch">dimitri.pusch</a>
          </p>
          <p>text.dev.br &copy; 2024</p>
        </div>
      </footer>
    </body>
  );
}
