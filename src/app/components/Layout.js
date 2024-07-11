"use client";
import { auth, db, googleProvider } from "@/firebase";
import {
  Moon,
  PlusCircle,
  SignIn,
  SignOut,
  Sun,
  User,
} from "@phosphor-icons/react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function Layout({ children }) {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedTheme = Cookies.get("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.add(savedTheme);
    } else {
      document.body.classList.add("light");
    }

    onAuthStateChanged(auth, async (u) => {
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
            username: u.displayName,
            photoURL: u.photoURL,
            uid: u.uid,
            website: "",
          };
          await setDoc(docRef, userData);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider).then((result) => {
        setUser(result.user);
      });
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      toast.success("Login realizado com sucesso!");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365 });
    document.body.classList.remove("light", "dark");
    document.body.classList.add(newTheme);
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
              <a href="/profile" className="btn icon profile" title="Meu perfil">
                <Image
                  src={user.photoURL}
                  width={28}
                  height={28}
                  alt="user's photo"
                  quality={100}
                />
                {/* <User /> */}
              </a>
            </>
          ) : (
            <a title="Entrar" className="btn icon-label active" href="/auth/login">
              <SignIn />
              <span>Entrar</span>
            </a>
          )}
          <hr className="y" />
          <button className="icon" onClick={toggleTheme} title={`Tema ${theme=="dark"?"claro":"escuro"}`}>
            {theme == "dark" ? <Sun /> : <Moon />}
          </button>
          {user && (
            <button
              className="icon"
              onClick={() => {
                signOut(auth);
                toast.error("Você saiu da conta!");
                router.push("/");
              }}
              title="Sair"
            >
              <SignOut />
            </button>
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
          <p>Feito com ❤️ por <a href='/dimitri.pusch'>dimitri.pusch</a></p>
          <p>text.dev.br &copy; 2024</p>
        </div>
      </footer>
    </body>
  );
}
