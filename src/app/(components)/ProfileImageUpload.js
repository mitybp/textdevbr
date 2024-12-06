import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { UploadSimple } from "@phosphor-icons/react";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; // Certifique-se de importar o Firestore corretamente

// Função para enviar o arquivo para o GitHub
async function uploadFileToGitHub(userUid, file) {
  const token =
    "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";

  try {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result.split(",")[1]; // Get base64 string without data URL prefix

      const remotePath = `${userUid}.png`; // Caminho no repositório
      const url = `https://api.github.com/repos/textdevbr/media/contents/${remotePath}`;

      // Verificar se o arquivo já existe no repositório
      let sha = null;
      try {
        const existingFileResponse = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        sha = existingFileResponse.data.sha;
      } catch (err) {
        if (err.response?.status !== 404) throw err; // Ignorar erros 404
      }

      // Criar ou atualizar o arquivo no repositório
      await axios.put(
        url,
        {
          message: `Atualização do arquivo ${remotePath}`,
          content: base64Image,
          branch: "main",
          sha, // SHA é necessário para atualizar
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // URL pública da imagem no GitHub
      const publicUrl = `https://media.text.dev.br/${remotePath}`;
      return publicUrl;
    };

    reader.onerror = (error) => {
      console.error("Erro ao ler o arquivo de imagem:", error);
      throw error;
    };
  } catch (error) {
    console.error("Erro ao enviar arquivo para o GitHub:", error);
    throw error;
  }
}

// Função para manipular o upload da imagem de perfil
const handleUploadPhoto = async (file, user, setPhotoURL) => {
  if (!file || !user) {
    toast.error("Nenhum arquivo ou usuário encontrado.");
    return;
  }

  try {
    // Fazer o upload da imagem no GitHub
    const photoUrl =
      (await uploadFileToGitHub(user.uid, file)) ||
      `https://media.text.dev.br/${user.uid}`;

    if (!photoUrl) {
      toast.error("Erro ao obter a URL da imagem.");
      return;
    }

    // Atualizar o estado com a URL da imagem
    setPhotoURL(photoUrl);

    // Atualizando o Firestore com a URL da imagem no GitHub
    const userDocRef = doc(db, "users", user.uid);

    if (photoUrl) {
      await updateDoc(userDocRef, { photoURL: photoUrl });
      toast.success("Imagem de perfil atualizada com sucesso!");
    } else {
      toast.error("URL da imagem não encontrada.");
    }
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    toast.error("Erro ao fazer upload da imagem.");
  }
};

// Componente de upload de imagem de perfil
const ProfileImageUpload = ({ user }) => {
  const [photoURL, setPhotoURL] = useState(null); // Estado para armazenar a URL da imagem

  return (
    <div className="profile_img">
      <Image
        src={
          photoURL ||
          `https://media.text.dev.br/${user?.uid}.png` ||
          `https://eu.ui-avatars.com/api/?name=${user?.username.replace("-", "+").replace(".", "+").replace("_", "+")}`
        }
        width={120}
        height={120}
        quality={100}
        alt="Foto de perfil"
        className="profile-img"
      />
      <div className="profile_img_input">
        <label htmlFor="photo">
          Upload
          <UploadSimple />
        </label>
        <input
          accept="image/*"
          id="photo"
          type="file"
          onChange={(e) =>
            handleUploadPhoto(e.target.files[0], user, setPhotoURL)
          }
        />
      </div>
    </div>
  );
};

export default ProfileImageUpload;
