import { Injectable, inject, signal } from '@angular/core';
import { AuditStore } from './audit-store';
import { EMAIL_TEMPLATES, EmailTemplate } from '../data/email.templates';
import { SMS_TEMPLATES, SmsTemplate } from '../data/sms.templates';

export type MessageContext = Record<string, string | number | undefined | null>;

@Injectable({ providedIn: 'root' })
export class MessagingStore {
  private readonly audit = inject(AuditStore);
  private readonly sms = signal<SmsTemplate[]>(SMS_TEMPLATES);
  private readonly email = signal<EmailTemplate[]>(EMAIL_TEMPLATES);

  smsTemplates = this.sms.asReadonly();
  emailTemplates = this.email.asReadonly();

  render(text: string, ctx: MessageContext) {
    return text.replace(/{{(.*?)}}/g, (_, key) => {
      const k = String(key).trim();
      const v = ctx[k];
      if (v === null || v === undefined) return '';
      return String(v);
    });
  }

  addSmsTemplate(template: SmsTemplate) {
    this.sms.update(list => [...list, template]);
  }

  addEmailTemplate(template: EmailTemplate) {
    this.email.update(list => [...list, template]);
  }

  sendSms(to: string[], templateId: string, ctx: MessageContext) {
    const tpl = this.sms().find(t => t.id === templateId) ?? this.sms()[0];
    if (!tpl) return null;
    const body = this.render(tpl.body, ctx);
    this.audit.add('RFQ_SMS_SENT', tpl.id, body.slice(0, 120), 'Tarun (CEO)', { notes: `To: ${to.join(', ')}` });
    alert(`SMS sent to ${to.join(', ')}:\n\n${body}`);
    return { to, body, templateId: tpl.id };
  }

  sendEmail(to: string[], templateId: string, ctx: MessageContext) {
    const tpl = this.email().find(t => t.id === templateId) ?? this.email()[0];
    if (!tpl) return null;
    const subject = this.render(tpl.subject, ctx);
    const body = this.render(tpl.body, ctx);
    this.audit.add('RFQ_EMAIL_SENT', tpl.id, `${subject} :: ${body.slice(0, 80)}`, 'Tarun (CEO)', {
      notes: `To: ${to.join(', ')}`
    });
    alert(`Email sent to ${to.join(', ')}:\n\nSubject: ${subject}\n\n${body}`);
    return { to, subject, body, templateId: tpl.id };
  }
}
