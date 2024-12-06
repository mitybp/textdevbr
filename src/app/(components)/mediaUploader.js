import axios from "axios";

async function uploadFileToGitHub(userUid, file) {
  const token =
    "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";

  try {
    // Read file as base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result.split(",")[1]; // Get base64 string without data URL prefix

      const remotePath = `${userUid}.png`; // Caminho no repositório
      const url = `https://api.github.com/repos/mitybp/media-textdevbr/contents/${remotePath}`;

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
          branch: "main", // Assuming main is the default branch
          sha, // SHA é necessário para atualizar
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Construir a URL do GitHub Pages
      const publicUrl = `https://mitybp.github.io/media-textdevbr/${remotePath}`;
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

export { uploadFileToGitHub };
