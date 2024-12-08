"use client";
import { auth, db } from "@/firebase";
import {
  Devices,
  Gear,
  Moon,
  PencilSimple,
  PlusCircle,
  Pulse,
  SignIn,
  SignOut,
  Sun,
  User,
} from "@phosphor-icons/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

function Layout({ children }) {
  const [theme, setTheme] = useState("light");
  const [cookieTheme, setCookieTheme] = useState("light");
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();
  const [newActivity, setNewActivity] = useState(null);

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

  useEffect(() => {
    const savedTheme = Cookies.get("theme") || "light";
    setTheme(savedTheme);
    setCookieTheme(savedTheme);
    document.body.classList.add(savedTheme);
  }, []);

  const toggleTheme = (selectedTheme) => {
    const newTheme =
      selectedTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : selectedTheme;

    setTheme(newTheme);
    setCookieTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365 });
    document.body.classList.replace("light", newTheme);
    document.body.classList.replace("dark", newTheme);
  };

  const ThemeToggleButtonUnlogged = memo(({ currentTheme, toggleTheme }) => (
    <button
      className={`icon ${currentTheme === "dark" ? "active" : ""}`}
      onClick={() => toggleTheme(currentTheme === "dark" ? "light" : "dark")}
    >
      {currentTheme === "dark" ? <Sun /> : <Moon />}
    </button>
  ));

  ThemeToggleButtonUnlogged.displayName = "ThemeToggleButtonUnlogged";

  return (
    <body className={theme}>
      <Toaster position="top-center" />
      <SpeedInsights />
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
                className={`btn icon ${newActivity ? "dot" : ""}`}
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
                    onClick={() => menuRef.current.removeAttribute("open")}
                  >
                    Meu perfil <User />
                  </Link>
                  <hr />
                  <Link
                    href="/settings/profile"
                    className="btn icon-label"
                    onClick={() => menuRef.current.removeAttribute("open")}
                  >
                    Editar perfil <PencilSimple />
                  </Link>

                  <Link
                    href="/settings/account"
                    className="btn icon-label"
                    onClick={() => menuRef.current.removeAttribute("open")}
                  >
                    Configurações <Gear />
                  </Link>
                  <div className="slider">
                    <button
                      className={`icon ${theme == "system" ? "active" : ""}`}
                      onClick={() => toggleTheme("system")}
                    >
                      <Devices />
                    </button>
                    <button
                      className={`icon ${theme == "light" ? "active" : ""}`}
                      onClick={() => toggleTheme("light")}
                    >
                      <Sun />
                    </button>
                    <button
                      className={`icon ${theme == "dark" ? "active" : ""}`}
                      onClick={() => toggleTheme("dark")}
                    >
                      <Moon />
                    </button>
                  </div>
                  <hr />
                  <Link
                    className="btn icon-label danger"
                    href="/auth/signout"
                    title="Sair"
                    onClick={() => menuRef.current.removeAttribute("open")}
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
              <ThemeToggleButtonUnlogged
                currentTheme={theme}
                toggleTheme={toggleTheme}
              />
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

export default Layout;
