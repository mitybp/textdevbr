"use client"

import {
  EnvelopeSimple,
  Link,
  PaperPlaneTilt,
  QrCode,
  ThreadsLogo,
  TwitterLogo,
  WhatsappLogo
} from "@phosphor-icons/react";
import { forwardRef } from "react";
import toast from "react-hot-toast";

const ShareMenu = forwardRef((props, ref) => {
  let {text, link, qrpath, side} = props

  return (
    <details className="md" ref={ref}>
      <summary>
        <PaperPlaneTilt />
      </summary>
      <div className={side||"left"}>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://api.whatsapp.com/send?text=${text} ${link}`}
          className="btn icon-label"
        >
          WhatsApp
          <WhatsappLogo />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.threads.net/intent/post/?text=${text} ${link}`}
          className="btn icon-label"
        >
          Threads <ThreadsLogo />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://x.com/share/?text=${text}&url=${link}`}
          className="btn icon-label"
        >
          Twitter <TwitterLogo />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`mailto:?subject=${text}&body=${text} ${link}`}
          className="btn icon-label"
        >
          Email <EnvelopeSimple />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`/qrcode/${qrpath}`}
          className="btn icon-label"
        >
          QR code <QrCode />
        </a>
        <button
          className="icon-label"
          onClick={() => {
            toast.success("Link copiado!");
            navigator.clipboard.writeText(link);
          }}
        >
          Copiar link <Link />
        </button>
      </div>
    </details>
  );
});

export default ShareMenu;
