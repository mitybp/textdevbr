const Error404 = () => {
  return (
    <section className='error'>
        <h1>Erro 404</h1>
        <p>Página não encontrada!</p>
        <Link href='/' className='btn active'>Retornar à página inicial</Link>
    </section>
  )
}

import Link from "next/link";

export default Error404
