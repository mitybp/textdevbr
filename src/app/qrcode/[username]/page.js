"use client";

import { useEffect, useState } from "react";

let QRCode = require("qrcode");

const UserQRCode = ({ params }) => {
  const [img, setImg] = useState(null);

  useEffect(() => {
    document.title = `Compartilhe o QR code do perfil ${params.username} - text.dev.br`

    const generate = async () => {
      try {
        let qrImg = await QRCode.toDataURL(
          `https://text.dev.br/${params.username}`
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
          <a className="btn active" href={img} download={`${params.username.replaceAll(".","_")}_qrcode.png`}>
            Baixar QR code
          </a>
        </div>
      </section>
    </>
  );
};

export default UserQRCode;
