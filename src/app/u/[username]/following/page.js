"use client";

import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Following = ({ params }) => {
  const [following, setFollowing] = useState([]);
  const [profileUid, setProfileUid] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileUid = async () => {
      try {
        // Obtém o UID do usuário com base no username nos parâmetros
        const userQueryRef = query(collection(db, "users"), where("username", "==", params.username));
        const userQuerySnap = await getDocs(userQueryRef);

        if (userQuerySnap.empty) {
          toast.error("Usuário não encontrado.");
          router.push("/404");
          return;
        }

        setProfileUid(userQuerySnap.docs[0].data().uid);
      } catch (error) {
        toast.error("Erro ao carregar o perfil.");
        console.error("Erro ao buscar UID do usuário:", error);
      }
    };

    fetchProfileUid();
  }, [params.username, router]);

  useEffect(() => {
    if (!profileUid) return;

    const fetchFollowing = async () => {
      try {
        // Busca a lista de "following" do perfil identificado pelo UID
        const userDocRef = doc(db, "users", profileUid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          toast.error("Dados do perfil não encontrados.");
          return;
        }

        const { following: followingList } = userDoc.data();

        if (!followingList || followingList.length === 0) {
          setFollowing([]);
          toast("Este usuário ainda não segue ninguém.", { icon: "👀" });
          return;
        }

        // Busca os dados dos usuários seguidos
        const followingPromises = followingList.map((uid) =>
          getDoc(doc(db, "users", uid))
        );
        const followingDocs = await Promise.all(followingPromises);

        const users = followingDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
          }));

        setFollowing(users);
      } catch (error) {
        toast.error("Erro ao carregar os usuários seguidos.");
        console.error("Erro ao buscar usuários seguidos:", error);
      }
    };

    fetchFollowing();
  }, [profileUid]);

  return (
    <>
      <h1>Seguindo</h1>
      <section className="user_list">
        {following.length > 0 ? (
          following.map((user) => (
            <div key={user.uid} className="user-card">
              <Link href={`/u/${user.username}`}>
                <img src={user.photoURL} alt={`${user.username}'s avatar`} />
                <span>{user.username}</span>
              </Link>
            </div>
          ))
        ) : (
          <p>Este usuário ainda não segue ninguém.</p>
        )}
      </section>
    </>
  );
};

export default Following;
