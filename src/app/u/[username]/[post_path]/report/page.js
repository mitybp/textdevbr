"use client";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ReportPost = ({ params }) => {
  const [reasons, setReasons] = useState([]); // Agora é um array
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    document.title = "Denunciar postagem - text.dev.br";

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const tempUser = userDocSnap.data();
          setUser({ ...tempUser, uid: u.uid });
        }
      } else {
        router.push(
          `/auth/login/?redirect=/u/${params.username}/${params.post_path}/report`
        );
        toast.error("Faça login para denunciar a postagem.");
      }
    });

    return () => unsubscribe();
  }, [router, user]);

  const toggleReason = (reason) => {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa fazer login para denunciar a postagem!");
      router.push(
        `/auth/login/?redirect=/${params.username}/${params.post_path}/report`
      );
      return;
    }

    if (reasons.length === 0) {
      toast.error("Selecione pelo menos uma razão para a denúncia!");
      return;
    }

    try {
      const reportedUserQuery = query(
        collection(db, "users"),
        where("username", "==", params.username)
      );
      const reportedUserSnap = await getDocs(reportedUserQuery);

      if (reportedUserSnap.empty) {
        toast.error("Usuário não encontrado!");
        return;
      }

      const reportedUser = reportedUserSnap.docs[0].data();

      const reportDocData = {
        reasons, // Armazena múltiplos motivos
        post_path: params.username + "/" + params.post_path,
        reporter: {
          username: user.username,
          uid: user.uid,
        },
        reported: {
          username: reportedUser.username,
          uid: reportedUser.uid,
        },
        date: new Date(),
      };

      await addDoc(collection(db, "reports"), reportDocData);
      toast.success("Denúncia enviada com sucesso!");
      router.push(`/u/${params.username}`);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao enviar a denúncia. Tente novamente.");
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

  return (
    <>
      <h1>Denunciar postagem</h1>
      <p>
        Caso você denuncie com o fim de prejudicar o usuário, você poderá ser
        bloqueado ou expulso da comunidade.
      </p>
      <section className="form">
        <div className="input">
          {[
            "Conteúdo abusivo",
            "Violação do Código de Conduta do Usuário",
            "Violação da Privacidade",
            "Fraude ou tentativa de scam",
            "Discurso de ódio, discriminação ou preconceito",
            "Conteúdo não relevante para a comunidade",
          ].map((reason) => (
            <label
              key={reason}
              className="checkbox"
              onClick={() => toggleReason(reason)}
            >
              <span className={reasons.includes(reason) ? "checked" : ""} />
              {reason}
            </label>
          ))}
        </div>
        <p>
          <b>
            Confira se esta é a postagem que você irá denúnciar para evitar
            conflitos e denúncias equivocadas.
          </b>
        </p>
        <div className="buttons">
          <Link
            href={`/u/${params.username}/${params.post_path}`}
            className="btn"
          >
            Cancelar
          </Link>
          <button className="active" onClick={handleSubmit}>
            Enviar denúncia
          </button>
        </div>
      </section>
    </>
  );
};

import Link from "next/link";

export default ReportPost;
