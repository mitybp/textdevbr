const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = timestamp.toDate(); // Para Firestore Timestamp, converte para objeto Date
  const diff = now - date;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  if (years >= 1) return `${years} ${years === 1 ? "ano" : "anos"} atrás`;
  if (months >= 1) return `${months} ${months === 1 ? "mês" : "meses"} atrás`;
  if (weeks >= 1) return `${weeks} ${weeks === 1 ? "semana" : "semanas"} atrás`;
  if (days >= 1) return `${days} ${days === 1 ? "dia" : "dias"} atrás`;
  if (hours >= 1) return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"} atrás`;
};

const formatFullDate = (timestamp) => {
  const date = timestamp.toDate();
  const diasSemana = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const diaSemana = diasSemana[date.getDay()];
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = meses[date.getMonth()];
  const ano = date.getFullYear();
  const horas = date.getHours().toString().padStart(2, "0");
  const minutos = date.getMinutes().toString().padStart(2, "0");

  return `${diaSemana}, ${dia} de ${mes} de ${ano} às ${horas}:${minutos}`;
};

const formatDate = (timestamp) => {
  const date = timestamp.toDate();
  const dia = date.getDate().toString().padStart(2, "0");
  const mes = date.getMonth().toString().padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

export { formatFullDate, formatTimeAgo, formatDate };
