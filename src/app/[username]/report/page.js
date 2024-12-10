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
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ReportUser = ({ params }) => {
  const [reasons, setReasons] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    document.title = "Denunciar usuário - text.dev.br";

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDocRef = doc(db, "users", u.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const tempUser = userDocSnap.data();
          setUser({ ...tempUser, uid: u.uid });
        }
      } else {
        router.push(`/auth/login/?redirect=/${params.username}/report`);
        toast.error("Faça login para denunciar o usuário.");
      }
    });

    setInterval(() => {
      return () => unsubscribe();
    }, 10000);
  }, [router]);

  const handleReasonToggle = (reason) => {
    setReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
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
        reasons,
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
      router.push(`/${params.username}`);
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao enviar a denúncia. Tente novamente.");
    }
  };

  return (
    <>
      <h1>Denunciar usuário</h1>
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
            "Informações não apropriadas no perfil",
            "Usuário menor de 15 anos",
            "Conteúdo não relevante para a comunidade",
          ].map((reason) => (
            <label
              key={reason}
              className="checkbox"
              onClick={() => handleReasonToggle(reason)}
            >
              <span className={reasons.includes(reason) ? "checked" : ""} />
              {reason}
            </label>
          ))}
        </div>
        <p>
          <b>
            Confira se este é o perfil que você irá denúnciar para evitar
            conflitos e denúncias equivocadas.
          </b>
        </p>
        <h3>
          Usuário a ser denunciado:{" "}
          <a href={`/${params.username}`}>{params.username}</a>
        </h3>
        <div className="buttons">
          <Link href={`/${params.username}`} className="btn">
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

export default ReportUser;
