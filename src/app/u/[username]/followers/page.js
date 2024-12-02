"use client";

import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Followers = ({ params }) => {
  const [followers, setFollowers] = useState([]);
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

    const fetchFollowers = async () => {
      try {
        // Busca a lista de "followers" do perfil identificado pelo UID
        const userDocRef = doc(db, "users", profileUid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          toast.error("Dados do perfil não encontrados.");
          return;
        }

        const { followers: followersList } = userDoc.data();

        if (!followersList || followersList.length === 0) {
          setFollowers([]);
          toast.error("Este usuário não possui seguidores.")
          return;
        }

        // Busca os dados dos seguidores
        const followersPromises = followersList.map((uid) =>
          getDoc(doc(db, "users", uid))
        );
        const followersDocs = await Promise.all(followersPromises);

        const users = followersDocs
          .filter((docSnap) => docSnap.exists())
          .map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
          }));

        setFollowers(users);
      } catch (error) {
        toast.error("Erro ao carregar os seguidores.");
        console.error("Erro ao buscar seguidores:", error);
      }
    };

    fetchFollowers();
  }, [profileUid]);

  return (
    <>
      <h1>Seguidores</h1>
      <section className="user_list">
        {followers.length > 0 ? (
          followers.map((user) => (
            <div key={user.uid} className="user-card">
              <Link href={`/u/${user.username}`}>
                <img src={user.photoURL} alt={`${user.username}'s avatar`} />
                <span>{user.username}</span>
              </Link>
            </div>
          ))
        ) : (
          <p>Este usuário ainda não possui seguidores.</p>
        )}
      </section>
    </>
  );
};

export default Followers;
