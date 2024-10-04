"use client";

import { useEffect, useState } from "react";

let QRCode = require("qrcode");

const UserQRCode = ({ params }) => {
  const [img, setImg] = useState(null);

  useEffect(() => {
    document.title = `Compartilhe o QR code da postagem de ${params.username} - text.dev.br`
    const generate = async () => {
      try {
        let qrImg = await QRCode.toDataURL(
          `https://text.dev.br/${params.username}/${params.post_path}`
        );
        setImg(qrImg);
      } catch (err) {
        console.error(err);
      }
    };
    return () => generate();
  });
  return (
    <>
      <h1>QR code</h1>
      <section className="form">
        <div className="qrcode">
          <img src={img} />
        </div>
        <div className="buttons">
          <a href={`/${params.username}`} className="btn">
            Cancelar
          </a>
          <a className="btn active" href={img} download={`${params.post_path.replaceAll(".","_")}_qrcode.png`}>
            Baixar QR code
          </a>
        </div>
      </section>
    </>
  );
};

export default UserQRCode;
