import {
  EnvelopeSimple,
  Link,
  PaperPlaneTilt,
  QrCode,
  ThreadsLogo,
  TwitterLogo,
  WhatsappLogo,
  X
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { forwardRef, useState } from "react";
import toast from "react-hot-toast";

const ShareMenu = forwardRef(({ text, path, side = "right" }, ref) => {
  const [modal, setModal] = useState(false);
  let link = "https://text.dev.br/" + path;

  const shareOptions = [
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${text} ${link}`,
      icon: <WhatsappLogo />,
    },
    {
      name: "Threads",
      href: `https://www.threads.net/intent/post/?text=${text} ${link}`,
      icon: <ThreadsLogo />,
    },
    {
      name: "Twitter",
      href: `https://x.com/share/?text=${text}&url=${link}`,
      icon: <TwitterLogo />,
    },
    {
      name: "Email",
      href: `mailto:?subject=${text}&body=${text} ${link}`,
      icon: <EnvelopeSimple />,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const handleQRCodeDownload = () => {
    const qrCanvas = document.getElementById("qr-code-canvas");
    const link = qrCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = link;
    downloadLink.download = "qrcode.png";
    downloadLink.click();
  };

  return (
    <>
      {modal && (
        <div className="modal">
          <div className="modal_container">
            <div className="modal_header">
              <h3>QR Code</h3>
              <button className="icon" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>
            <div className="modal_content">
              <QRCodeSVG id="qr-code-canvas" value={link} size={380}/>
              <div className="buttons">
                <button onClick={()=>setModal(false)}>Cancelar</button>
                <button onClick={()=>handleQRCodeDownload()} className="active">
                  Baixar QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <details className="md" ref={ref}>
        <summary className={side == "inside" ? "icon-label" : undefined}>
          {side == "inside" ? "Compartilhar" : undefined}
          <PaperPlaneTilt />
        </summary>
        <div className={side}>
          <button className="icon-label" onClick={handleCopyLink}>
            Copiar link <Link />
          </button>
          <hr/>
          {shareOptions.map(({ name, href, icon }) => (
            <a
              key={name}
              target="_blank"
              rel="noopener noreferrer"
              href={href}
              className="btn icon-label"
            >
              {name} {icon}
            </a>
          ))}
          <button
            className="icon-label"
            onClick={() => {
              setModal(true);
              ref.current.open = false;
            }}
          >
            QR code <QrCode />
          </button>
        </div>
      </details>

      {/* {isQRModalOpen && (
        <div className="qr-modal">
          <div className="qr-modal-content">
            <QRCodeCanvas id="qr-code-canvas" value={link} size={300} />
            <div className="modal-footer">
              <button onClick={() => setQRModalOpen(false)}>Cancelar</button>
              <button className="active" onClick={handleQRCodeDownload}>
                Baixar
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
});
ShareMenu.displayName = "ShareMenu";
export default ShareMenu;
