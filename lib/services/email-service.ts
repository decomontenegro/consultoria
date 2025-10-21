import { Report } from '@/lib/types';
import { formatCurrency } from '@/lib/calculators/roi-calculator';

/**
 * Email Service
 * Handles email generation and sending
 */

/**
 * Generate HTML email template for report
 */
export function generateReportEmailHTML(report: Report, shareLink?: string): string {
  const { assessmentData, roi } = report;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Relatório de Prontidão para IA - CulturaBuilder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e17;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e17;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1f2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 255, 136, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px; background: linear-gradient(135deg, #00ff88 0%, #00d9ff 100%);">
              <h1 style="margin: 0; color: #0a0e17; font-size: 32px; font-weight: bold;">
                CulturaBuilder
              </h1>
              <p style="margin: 10px 0 0 0; color: #0a0e17; font-size: 16px; opacity: 0.8;">
                Relatório de Prontidão para IA
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #e5e7eb; font-size: 24px;">
                Olá, ${assessmentData.contactInfo?.name || 'Cliente'}!
              </h2>

              <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 16px; line-height: 1.6;">
                Seu relatório personalizado de ROI de IA para <strong style="color: #00ff88;">${assessmentData.companyInfo.name}</strong> está pronto!
              </p>

              <!-- Metrics Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td width="33%" style="padding: 20px; background-color: #0f1419; border-radius: 8px; text-align: center;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      Payback
                    </div>
                    <div style="color: #00ff88; font-size: 28px; font-weight: bold;">
                      ${roi.paybackPeriodMonths.toFixed(1)}m
                    </div>
                  </td>
                  <td width="10"></td>
                  <td width="33%" style="padding: 20px; background-color: #0f1419; border-radius: 8px; text-align: center;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      NPV 3 Anos
                    </div>
                    <div style="color: #00d9ff; font-size: 28px; font-weight: bold;">
                      ${formatCurrency(roi.threeYearNPV)}
                    </div>
                  </td>
                  <td width="10"></td>
                  <td width="33%" style="padding: 20px; background-color: #0f1419; border-radius: 8px; text-align: center;">
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      ROI
                    </div>
                    <div style="color: #b16ced; font-size: 28px; font-weight: bold;">
                      ${roi.irr.toFixed(0)}%
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Key Insights -->
              <div style="margin: 30px 0; padding: 20px; background-color: rgba(0, 255, 136, 0.1); border-left: 4px solid #00ff88; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #00ff88; font-size: 18px;">
                  ✨ Destaques do Relatório
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #9ca3af; line-height: 1.8;">
                  <li>ROI positivo em menos de ${Math.ceil(roi.paybackPeriodMonths)} meses</li>
                  <li>Economia anual estimada de ${formatCurrency(roi.benefits.totalAnnualSavings)}</li>
                  <li>Análise baseada em dados verificados do mercado</li>
                </ul>
              </div>

              ${shareLink ? `
              <!-- Share Link -->
              <div style="margin: 30px 0; text-align: center;">
                <a href="${shareLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00ff88 0%, #00d9ff 100%); color: #0a0e17; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Ver Relatório Completo
                </a>
              </div>
              ` : ''}

              <!-- CTA -->
              <p style="margin: 30px 0 10px 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                <strong>Próximos Passos:</strong>
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                <li>Revise o relatório completo com sua equipe</li>
                <li>Explore os casos similares verificados</li>
                <li>Agende uma consulta com nossos especialistas</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0f1419; text-align: center; border-top: 1px solid #1f2937;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                © 2025 CulturaBuilder. Todos os dados baseados em pesquisas verificáveis.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Este email foi gerado automaticamente. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate mailto link with report
 */
export function generateMailtoLink(
  report: Report,
  recipient?: string
): string {
  const email = recipient || report.assessmentData.contactInfo?.email || '';
  const subject = encodeURIComponent(
    `Seu Relatório de Prontidão para IA - ${report.assessmentData.companyInfo.name}`
  );

  const body = encodeURIComponent(`
Olá!

Seu relatório de ROI de IA está pronto!

Empresa: ${report.assessmentData.companyInfo.name}
Indústria: ${report.assessmentData.companyInfo.industry}

Métricas Principais:
• Payback: ${report.roi.paybackPeriodMonths.toFixed(1)} meses
• NPV (3 anos): ${formatCurrency(report.roi.threeYearNPV)}
• ROI: ${report.roi.irr.toFixed(0)}%

Acesse o dashboard para visualizar o relatório completo:
${window.location.origin}/dashboard

Atenciosamente,
Equipe CulturaBuilder
  `.trim());

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/**
 * Send email via configured service (webhook, API, etc.)
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  try {
    // Check if webhook is configured
    const webhookUrl = process.env.NEXT_PUBLIC_EMAIL_WEBHOOK_URL;

    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html: htmlContent,
          from: 'noreply@culturabuilder.com',
        }),
      });

      return response.ok;
    }

    // Fallback: open mailto link
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoLink, '_blank');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send report via email
 */
export async function emailReport(
  report: Report,
  shareLink?: string
): Promise<boolean> {
  const email = report.assessmentData.contactInfo?.email;
  if (!email) return false;

  const subject = `Seu Relatório de Prontidão para IA - ${report.assessmentData.companyInfo.name}`;
  const htmlContent = generateReportEmailHTML(report, shareLink);

  return await sendEmail(email, subject, htmlContent);
}
