import { Resend } from 'resend';

let cachedClient: Resend | undefined;

function getResend(): Resend {
  if (!cachedClient) {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) throw new Error('RESEND_API_KEY missing');
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

function getSenderAddress(): string {
  return process.env['RESEND_FROM'] ?? 'Ámantis <onboarding@resend.dev>';
}

type SendPasswordResetParams = {
  to: string;
  name: string | null;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetParams): Promise<void> {
  const greeting = name ? `Hola, ${name}` : 'Hola';

  await getResend().emails.send({
    from: getSenderAddress(),
    to,
    subject: 'Restablece tu contraseña · Ámantis',
    html: renderHtml({ greeting, resetUrl }),
    text: renderText({ greeting, resetUrl }),
  });
}

function renderHtml({ greeting, resetUrl }: { greeting: string; resetUrl: string }): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#FAF6F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#241914;">
    <div style="max-width:480px;margin:0 auto;padding:40px 28px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:500;color:#7A0E20;letter-spacing:0.04em;margin-bottom:32px;">
        ÁMANTIS
      </div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:500;line-height:1.2;margin:0 0 14px 0;color:#241914;">
        ${greeting}.
      </h1>
      <p style="font-size:15px;line-height:1.6;color:#5C4838;margin:0 0 28px 0;">
        Recibimos una solicitud para cambiar la contraseña de tu cuenta. Toca el botón para crear una nueva. El enlace expira en 1 hora.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#7A0E20;color:#FAF6F2;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:500;">
        Cambiar contraseña
      </a>
      <p style="font-size:13px;line-height:1.6;color:#8C7866;margin:32px 0 0 0;">
        Si no fuiste tú, puedes ignorar este correo. Tu contraseña no cambiará.
      </p>
      <hr style="border:none;border-top:1px solid #E8DFD6;margin:32px 0 16px 0;" />
      <p style="font-size:11px;line-height:1.5;color:#A89888;margin:0;">
        Si el botón no funciona, copia y pega esta dirección en tu navegador:<br/>
        <span style="color:#5C4838;word-break:break-all;">${resetUrl}</span>
      </p>
    </div>
  </body>
</html>`;
}

function renderText({ greeting, resetUrl }: { greeting: string; resetUrl: string }): string {
  return `${greeting}.

Recibimos una solicitud para cambiar la contraseña de tu cuenta de Ámantis.
Abre este enlace para crear una nueva (expira en 1 hora):

${resetUrl}

Si no fuiste tú, puedes ignorar este correo. Tu contraseña no cambiará.

— Ámantis`;
}
