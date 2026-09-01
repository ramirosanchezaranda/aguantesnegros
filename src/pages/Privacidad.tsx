import { Link } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import { hasClarity } from '../lib/clarity'
import {
  CONTACT_EMAIL,
  LEGAL_ADDRESS,
  LEGAL_NAME,
  LEGAL_TAX_ID,
  PRIVACY_UPDATED,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from '../data/shop'

const UPDATED = new Date(`${PRIVACY_UPDATED}T00:00:00`).toLocaleDateString('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function Privacidad() {
  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <span aria-current="page">Política de privacidad</span>
        </nav>

        <header className="page__head">
          <div>
            <h1 className="page__title">
              Política de
              <br />
              privacidad
            </h1>
            <p className="page__sub">
              Qué datos te pedimos, para qué los usamos y cómo pedirnos que los borremos. Sin letra chica.
            </p>
          </div>
          <BrandMascot variant="question" className="page__mascot" title="Guantín leyendo la letra chica" />
        </header>

        <article className="legal">
          <p className="legal__updated">Última actualización: {UPDATED}</p>

          <p className="legal__lead">
            Te pedimos datos por una sola razón: para poder mandarte lo que comprás y cobrarte. Nada de lo que nos
            dejás se vende, se alquila ni se comparte con nadie que no sea necesario para que el pedido te llegue.
          </p>

          <h2>Quién guarda tus datos</h2>
          <p>
            A Guantes Negros es responsable de la base de datos donde quedan guardados tus pedidos.
            {LEGAL_NAME && ` Titular: ${LEGAL_NAME}.`}
            {LEGAL_TAX_ID && ` CUIT ${LEGAL_TAX_ID}.`}
            {LEGAL_ADDRESS && ` Domicilio: ${LEGAL_ADDRESS}.`}
          </p>
          <p>
            Para cualquier cosa que tenga que ver con tus datos, escribinos a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por WhatsApp al{' '}
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              {WHATSAPP_DISPLAY}
            </a>
            .
          </p>

          <h2>Qué datos guardamos y para qué</h2>

          <h3>Cuando terminás una compra</h3>
          <ul>
            <li>
              <strong>Nombre, email y WhatsApp.</strong> Para identificar el pedido, coordinar la entrega y el pago, y
              avisarte si pasa algo.
            </li>
            <li>
              <strong>Provincia, ciudad, dirección y código postal.</strong> Para cotizar el envío y despacharlo. El
              envío no se cobra en la web: con la dirección te pasamos por WhatsApp las opciones que llegan a tu zona.
            </li>
            <li>
              <strong>Qué compraste, cuánto pagaste y cuándo.</strong> Para el historial del pedido, la garantía, los
              cambios y para saber qué reponer.
            </li>
          </ul>
          <p>
            Los cuatro campos de la dirección son obligatorios: sin ellos no podemos cotizar ni despachar, así que no
            hay forma de terminar la compra sin darlos. Si preferís no cargarlos acá, escribinos por WhatsApp y armamos
            el pedido por ahí.
          </p>

          <h3>Mientras navegás</h3>
          <ul>
            <li>
              <strong>Tu carrito, de forma anónima.</strong> Guardamos qué productos entraron al carrito y cuándo,
              atados a un número al azar que genera tu navegador. No tiene tu nombre ni tu mail: sirve para contar
              cuántos carritos quedan sin comprar, no para contactarte.
            </li>
            <li>
              <strong>Preferencias tuyas.</strong> El modo claro u oscuro y el contenido del carrito quedan en el
              almacenamiento de tu propio navegador. No salen de tu dispositivo ni nos llegan.
            </li>
            {hasClarity() && (
              <li>
                <strong>Cómo usás el sitio, con Microsoft Clarity.</strong> Registra clics, scroll y navegación para
                que veamos dónde se traba la gente. <strong>El formulario del checkout va enmascarado</strong>: lo que
                escribís ahí (nombre, mail, WhatsApp, dirección) no se graba ni le llega a Microsoft.
              </li>
            )}
          </ul>

          <h2>Qué NO guardamos</h2>
          <p>
            <strong>Ningún dato de tu tarjeta.</strong> No los pedimos, no pasan por este sitio y no los podríamos
            guardar aunque quisiéramos: si pagás con tarjeta, te mandamos un link de Mercado Pago y el pago ocurre allá,
            con las condiciones de ellos. Tampoco guardamos contraseñas de clientes, porque la tienda no tiene cuentas:
            comprás sin registrarte.
          </p>

          <h2>Con quién los compartimos</h2>
          <p>Sólo con quien hace falta para que el pedido llegue, y sólo lo que hace falta:</p>
          <ul>
            <li>
              <strong>El correo o la mensajería</strong> que lleva el paquete: tu nombre, dirección y teléfono.
            </li>
            <li>
              <strong>Mercado Pago</strong>, si pagás con tarjeta, con sus propias condiciones.
            </li>
            <li>
              <strong>Supabase</strong>, que es donde vive la base de datos del sitio
              {hasClarity() && (
                <>
                  , y <strong>Microsoft Clarity</strong>, que procesa las estadísticas de uso
                </>
              )}
              .{hasClarity() ? ' Los dos tienen' : ' Tiene'} servidores fuera del país, así que tus datos se almacenan
              en el exterior.
            </li>
          </ul>
          <p>
            No vendemos ni cedemos tus datos a nadie más, y no los usamos para publicidad de terceros. Si alguna vez te
            escribimos por algo que no sea tu pedido, va a ser desde el mismo WhatsApp de siempre y podés pedirnos que
            no lo hagamos más.
          </p>

          <h2>Cuánto tiempo los guardamos</h2>
          <p>
            Los pedidos quedan guardados mientras sigan haciendo falta para la garantía, los cambios y las
            obligaciones contables e impositivas. Los carritos anónimos son estadística y se pueden borrar en cualquier
            momento sin que eso afecte a nadie. Si nos pedís que borremos tus datos, los sacamos, salvo lo que estemos
            obligados a conservar por ley.
          </p>

          <h2>Tus derechos</h2>
          <p>
            Podés pedirnos en cualquier momento que te digamos qué datos tuyos tenemos, que corrijamos los que estén
            mal, o que los borremos. Escribinos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> desde el mismo
            mail con el que compraste, o por WhatsApp desde el número que dejaste, y te respondemos. Es gratis y no
            hace falta que expliques por qué.
          </p>
          <p className="legal__legend">
            El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
            gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto
            conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.
          </p>
          <p className="legal__legend">
            La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley Nº 25.326,
            tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus
            derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
          </p>

          {hasClarity() && (
            <>
              <h2>Si no querés que midamos tu navegación</h2>
              <p>
                Clarity funciona con cookies. Podés bloquearlas desde la configuración de tu navegador, o navegar en
                una ventana privada, y el sitio va a andar igual: no usamos esas cookies para nada que haga falta para
                comprar. También podés desactivarlo para todos los sitios desde{' '}
                <a href="https://privacy.microsoft.com/es-es/privacystatement" target="_blank" rel="noreferrer">
                  la configuración de privacidad de Microsoft
                </a>
                .
              </p>
            </>
          )}

          <h2>Menores de edad</h2>
          <p>
            La tienda vende insumos para tatuar y está pensada para mayores de 18 años. No pedimos ni queremos datos de
            menores; si nos llega alguno, lo borramos.
          </p>

          <h2>Cambios en esta política</h2>
          <p>
            Si cambiamos algo, actualizamos la fecha de arriba. Si el cambio afecta lo que hacemos con datos que ya nos
            diste, te lo avisamos por el mismo WhatsApp.
          </p>

          <div className="legal__foot">
            <p>¿Alguna duda con esto? Preguntanos, no hay problema.</p>
            <a className="btn btn--primary" href={whatsappLink()} target="_blank" rel="noreferrer">
              <span className="btn__label">Escribinos por WhatsApp</span>
            </a>
          </div>
        </article>
      </div>
    </main>
  )
}
