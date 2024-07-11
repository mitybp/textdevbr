"use client";
import { auth, db } from "@/firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UploadSimple } from "@phosphor-icons/react";
import Image from "next/image";

export default function ProfileEdit() {
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState(``);
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const router = useRouter();

  const useFetchUserData = (setUser) => {
    useEffect(() => {
      onAuthStateChanged(auth, async (u) => {
        if (u) {
          const userDocRef = doc(db, "users", u.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const temp_user = userDocSnap.data();
            setUser(temp_user);
            setDescription(temp_user.description || "");
            setWebsite(temp_user.website || "");
            setUsername(temp_user.username || "");
            setPhotoURL(temp_user.photoURL || "");
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
            await setDoc(userDocRef, userData);
            setUser(userData);
            setDescription("");
            setWebsite("");
            setUsername(u.displayName || "");
            setPhotoURL(u.photoURL || "");
          }
        } else {
          router.push("/");
          toast.error("Faça login para editar seu perfil.");
        }
      });
    }, []);
  };

  useFetchUserData(setUser);

  const handleSave = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          description: description.replaceAll("\n", '<br/>'),
          website,
          username,
          photoURL,
        });
        await updateProfile(auth.currentUser, {
          displayName: username,
          photoURL,
        });
        toast.success("Perfil atualizado com sucesso!");
        router.push("/profile");
      } catch (error) {
        toast.error("Erro ao atualizar perfil.");
        console.error("Erro ao atualizar perfil:", error);
      }
    }
  };

  const handleFileUpload = async (e) => {
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

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <h1>Editar Perfil</h1>
      <section className="form">
        <div className="profile_img">
          {photoURL && (
            <Image src={photoURL} width={100} height={100} alt="Foto de perfil" className="profile-img" />
          )}
          <label htmlFor="photo">
            <UploadSimple />
            Upload
          </label>
          <input
            accept="image/*"
            id="photo"
            type="file"
            onChange={handleFileUpload}
          />
        </div>
        <div>
          <div className="input">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de Usuário"
            />
          </div>
          <textarea
            maxLength={2000}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
          ></textarea>
          <div className="input">
            <input
              type="text"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://seuwebsite.com"
            />
          </div>
        </div>

        <div className="buttons">
          <a href="/profile" className="btn">
            Cancelar
          </a>
          <button onClick={handleSave} className="active">
            Salvar
          </button>
        </div>
      </section>
    </>
  );
}
