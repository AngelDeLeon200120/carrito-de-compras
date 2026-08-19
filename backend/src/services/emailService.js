const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    }

    // Sin credenciales SMTP configuradas: usar una cuenta de pruebas Ethereal
    // que simula el envío real y permite previsualizar el correo en un navegador.
    const testAccount = await nodemailer.createTestAccount();
    logger.info('Usando cuenta Ethereal de pruebas para el envío de correo', {
      user: testAccount.user,
    });
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
      // Algunas redes corporativas/antivirus interceptan TLS con un certificado
      // propio que Node no reconoce ("self-signed certificate in certificate
      // chain"). Esta cuenta es solo de pruebas (Ethereal), así que se relaja
      // la validación del certificado únicamente en esta rama.
      tls: { rejectUnauthorized: false },
    });
  })();

  return transporterPromise;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
}

async function sendOrderConfirmation({ user, order }) {
  try {
    const transporter = await getTransporter();

    const itemsHtml = order.items
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatCurrency(
            item.price
          )}</td></tr>`
      )
      .join('');

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"Sports Cart" <no-reply@sportscart.dev>',
      to: user.email,
      subject: `Confirmación de tu compra #${order.orderId}`,
      html: `
        <h2>¡Gracias por tu compra, ${user.name}!</h2>
        <p>Pedido: <strong>${order.orderId}</strong></p>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info('Correo de confirmación enviado (preview Ethereal)', { previewUrl });
    } else {
      logger.info('Correo de confirmación enviado', { messageId: info.messageId });
    }
    return { messageId: info.messageId, previewUrl: previewUrl || null };
  } catch (err) {
    // El envío de correo no debe tumbar el checkout si falla.
    logger.error('No se pudo enviar el correo de confirmación', { error: err.message });
    return { messageId: null, previewUrl: null, error: err.message };
  }
}

module.exports = { sendOrderConfirmation };
