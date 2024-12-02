"use client";
import { auth, db } from "@/firebase";
import {
  Gear,
  Moon,
  PencilSimple,
  PlusCircle,
  Pulse,
  SignIn,
  SignOut,
  Sun,
  User
} from "@phosphor-icons/react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

import Link from "next/link";

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
      }
    });

    return () => unsubscribe();
  }, [user]);

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

  return (
    <body className={theme}>
      <Toaster position="top-center" />
      <header>
        <Link href="/" className="brand">
          .dev
        </Link>
        <div className="links">
          {user ? (
            <>
              <Link
                href="/new"
                className="btn icon active"
                title="Nova postagem"
              >
                <PlusCircle />
              </Link>
              <hr className="y" />
              <Link
                href="/activity"
                className="btn icon"
                title="Minha atividade"
              >
                <Pulse />
              </Link>
              {/* <Link href="/notifications" className="btn icon" title="Notificações">
                <BellSimple />
              </Link> */}
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
                  <Link
                    href={`/u/${user.username}`}
                    className="btn icon-label active"
                  >
                    Meu perfil <User />
                  </Link>
                  <hr />
                  <Link href="/settings/profile" className="btn icon-label">
                    Editar perfil <PencilSimple />
                  </Link>

                  <Link href="/settings/account" className="btn icon-label">
                    Configurações <Gear />
                  </Link>

                  <button
                    className="icon-label"
                    onClick={toggleTheme}
                    title={`Tema ${theme === "dark" ? "claro" : "escuro"}`}
                  >
                    Mudar o tema {theme === "dark" ? <Sun /> : <Moon />}
                  </button>
                  <hr />
                  <Link
                    className="btn icon-label danger"
                    href="/auth/signout"
                    title="Sair"
                  >
                    Sair <SignOut />
                  </Link>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link
                title="Entrar"
                className="btn icon-label active"
                href="/auth/login"
              >
                <SignIn />
                <span>Entrar</span>
              </Link>
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
          <p>text.dev.br &copy; 2024</p>
        </div>
        <div>
          <Link href="/policies">Políticas</Link>
          <Link href="/code-of-conduct">Código de conduta</Link>
        </div>
        <div>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contato</Link>
        </div>
        <div>
          <p>
            Feito com ❤️ por <Link href="/u/dimitri.pusch">dimitri.pusch</Link>
          </p>
        </div>
      </footer>
    </body>
  );
}
