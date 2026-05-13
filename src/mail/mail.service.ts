import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NearbyLostPet } from '../lost-pets/lost-pets.service';

interface NotificationPayload {
  foundPet: {
    id: number;
    species: string;
    breed?: string;
    color: string;
    size: string;
    description: string;
    photo_url?: string;
    finder_name: string;
    finder_email: string;
    finder_phone: string;
    address: string;
    found_date: Date | string;
    latitude: number;
    longitude: number;
  };
  lostPet: NearbyLostPet;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
    });
  }

  private buildMapboxUrl(payload: NotificationPayload): string {
    const token = this.config.get('MAPBOX_TOKEN', '');
    if (!token) return '';

    const { foundPet, lostPet } = payload;

    const lostMarker  = `pin-s-marker+e74c3c(${lostPet.longitude},${lostPet.latitude})`;
    const foundMarker = `pin-s-marker+2ecc71(${foundPet.longitude},${foundPet.latitude})`;

    const centerLng = ((lostPet.longitude + foundPet.longitude) / 2).toFixed(6);
    const centerLat = ((lostPet.latitude  + foundPet.latitude)  / 2).toFixed(6);
    const encodedToken = encodeURIComponent(token);

    return (
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
      `${lostMarker},${foundMarker}/` +
      `${centerLng},${centerLat},14,0/` +
      `600x300@2x` +
      `?access_token=${encodedToken}`
    );
  }

  private buildEmailHtml(payload: NotificationPayload, mapUrl: string): string {
    const { foundPet, lostPet } = payload;

    const foundDate = new Date(foundPet.found_date).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const lostDate = new Date(lostPet.lost_date).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const distanceText =
      lostPet.distance < 1000
        ? `${Math.round(lostPet.distance)} metros`
        : `${(lostPet.distance / 1000).toFixed(2)} km`;

    const mapSection = mapUrl
      ? `<div style="margin:24px 0;text-align:center;">
           <img src="${mapUrl}"
                alt="Mapa con ubicaciones"
                style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;" />
           <p style="font-size:12px;color:#94a3b8;margin-top:6px;">
             Rojo: donde se perdió &nbsp;|&nbsp; Verde: donde fue encontrada
           </p>
           <p style="margin-top:10px;font-size:13px;color:#475569;">
             <a href="${mapUrl}" target="_blank" rel="noopener noreferrer"
                style="color:#6366f1;text-decoration:none;">
               Abrir mapa en una nueva pestaña
             </a>
           </p>
         </div>`
      : '';

    const photoSection = foundPet.photo_url
      ? `<div style="margin:16px 0;text-align:center;">
           <img src="${foundPet.photo_url}"
                alt="Foto de la mascota encontrada"
                style="max-width:320px;border-radius:8px;border:1px solid #e2e8f0;" />
         </div>`
      : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PetRadar – Posible coincidencia encontrada 🐾</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                PetRadar
              </h1>
              <p style="margin:8px 0 0;color:#c4b5fd;font-size:15px;">
                ¡Posible coincidencia detectada!
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0;">
              <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;
                           padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:15px;color:#92400e;">
                  🐾 Hola, <strong>${lostPet.owner_name}</strong>. Una mascota fue encontrada a
                  <strong>${distanceText}</strong> de donde reportaste la pérdida de
                  <strong>${lostPet.name}</strong>. ¡Podría ser ella/él!
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">${mapSection}</td>
          </tr>

          <tr>
            <td style="padding:0 40px 24px;">
              <h2 style="font-size:18px;font-weight:700;color:#6366f1;
                          border-bottom:2px solid #e0e7ff;padding-bottom:10px;margin-bottom:16px;">
                Mascota Encontrada
              </h2>
              ${photoSection}
              <table width="100%" cellpadding="0" cellspacing="0">
                ${buildRow('Especie',     foundPet.species)}
                ${buildRow('Raza',        foundPet.breed || 'No identificada')}
                ${buildRow('Color',       foundPet.color)}
                ${buildRow('Tamaño',      foundPet.size)}
                ${buildRow('Descripción', foundPet.description)}
                ${buildRow('Dirección',   foundPet.address)}
                ${buildRow('Fecha',       foundDate)}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 24px;">
              <h2 style="font-size:18px;font-weight:700;color:#10b981;
                          border-bottom:2px solid #d1fae5;padding-bottom:10px;margin-bottom:16px;">
                Contacto – Quien la encontró
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${buildRow('Nombre',    foundPet.finder_name)}
                ${buildRow('Correo',   `<a href="mailto:${foundPet.finder_email}" style="color:#6366f1;">${foundPet.finder_email}</a>`)}
                ${buildRow('Teléfono', `<a href="tel:${foundPet.finder_phone}" style="color:#6366f1;">${foundPet.finder_phone}</a>`)}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px;">
              <h2 style="font-size:18px;font-weight:700;color:#ef4444;
                          border-bottom:2px solid #fee2e2;padding-bottom:10px;margin-bottom:16px;">
                🐕 Tu Mascota Perdida (referencia)
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${buildRow('Nombre',    lostPet.name)}
                ${buildRow('Especie',   lostPet.species)}
                ${buildRow('Raza',      lostPet.breed)}
                ${buildRow('Color',     lostPet.color)}
                ${buildRow('Reportada', lostDate)}
                ${buildRow('Distancia', `<strong style="color:#6366f1;">${distanceText}</strong>`)}
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  async sendFoundPetNotification(payload: NotificationPayload): Promise<void> {
    const { foundPet, lostPet } = payload;

    const mapUrl   = this.buildMapboxUrl(payload);
    const html     = this.buildEmailHtml(payload, mapUrl);
    const mailTo   = this.config.get('MAIL_NOTIFICATION_TO', lostPet.owner_email);
    const mailFrom = this.config.get('MAIL_FROM', 'PetRadar <noreply@petradar.com>');

    const distanceText =
      lostPet.distance < 1000
        ? `${Math.round(lostPet.distance)} m`
        : `${(lostPet.distance / 1000).toFixed(1)} km`;

    await this.transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: `PetRadar: Posible coincidencia para "${lostPet.name}" a ${distanceText}`,
      html,
    });

    this.logger.log(`Correo enviado → ${mailTo} | Lost: ${lostPet.id} | Found: ${foundPet.id}`);
  }
}

function buildRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:6px 0;font-size:13px;color:#64748b;width:120px;
                vertical-align:top;font-weight:600;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#1e293b;">${value}</td>
  </tr>`;
}
