"use client";

import { auth, db } from "@/firebase";
import { Eye, EyeClosed } from "@phosphor-icons/react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    document.title = "Criar conta - text.dev.br";
  }, []);

  const handleSignUp = async () => {
    setErrors({});
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        toast.error("Já existe uma conta com este email.");
        router.push(`/auth/login/?email=${email}`);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        badges: [],
        description: "",
        email: user.email,
        emailVerified: false,
        followers: [],
        following: [],
        joinedAt: Timestamp.now(),
        likedPosts: [],
        photoURL: null,
        savedPosts: [],
        social: {
          facebook: "",
          github: "",
          instagram: "",
          threads: "",
          twitter: "",
          linkedin: "",
        },
        uid: user.uid,
        username: formatUsername(username),
        website: "",
      });

      toast.success("Conta criada com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error("Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = () => {
    const errors = {};
    if (!username) errors.username = "O nome de usuário é obrigatório.";
    if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = "Email inválido.";
    if (!password || password.length < 6)
      errors.password = "A senha deve ter pelo menos 6 caracteres.";
    setErrors(errors);
    return Object.keys(errors).length === 0;
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
    <section className="form">
      <h1>Criar conta</h1>
      <div>
        <div className="input">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nome de usuário"
            disabled={loading}
            required
            onBlur={() =>
              !username &&
              setErrors((err) => ({
                ...err,
                username: "O nome de usuário é obrigatório.",
              }))
            }
          />
        </div>
        {errors.username && <small className="danger">{errors.username}</small>}
        <div className="input">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            onBlur={() =>
              !email &&
              setErrors((err) => ({ ...err, email: "Email inválido." }))
            }
          />
        </div>
        {errors.email && <small className="danger">{errors.email}</small>}
        <div className="input">
          <input
            type={pwVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            disabled={loading}
            onBlur={() =>
              !password &&
              setErrors((err) => ({
                ...err,
                password: "A senha é obrigatória.",
              }))
            }
          />
          <button className="icon" onClick={() => setPwVisible(!pwVisible)}>
            {pwVisible ? <EyeClosed /> : <Eye />}
          </button>
        </div>
        {errors.password && <small className="danger">{errors.password}</small>}
        <button onClick={handleSignUp} disabled={loading} className="active">
          Criar conta
        </button>
        <div>
          <Link href="/auth/login/">Já tem uma conta? Faça login</Link>
        </div>
      </div>
    </section>
  );
}
