export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'RFQ_INVENTORY_EMAIL',
    name: 'RFQ - Inventory Dispatch',
    subject: 'RFQ: {{itemName}} ({{sku}}) - Qty {{qty}}',
    body:
      'Hello,\n\nWe need {{qty}} units of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Please share your best quotation, taxes, and lead time. Target delivery: {{dueDate}}.\n\n' +
      'Requester: {{requester}}\nApprover: {{approver}}\n\nThanks,\nFlowora Team'
  },
  {
    id: 'REMINDER_EMAIL',
    name: 'RFQ Reminder',
    subject: 'Reminder: RFQ pending for {{itemName}} ({{sku}})',
    body:
      'Hi,\n\nGentle reminder to share pricing and lead time for {{itemName}} ({{sku}}), qty {{qty}}. ' +
      'Request ID: {{requestId}}.\n\nThanks,\nFlowora Team'
  },
  {
    id: 'RFQ_VENDOR_LONGFORM',
    name: 'RFQ - Vendor Longform',
    subject: 'RFQ: {{itemName}} ({{sku}}) - Qty {{qty}}',
    body:
      'Hello {{vendor}},\n\n' +
      'We need {{qty}} units of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Please share your best quotation, taxes, and lead time. Target delivery: {{targetDate}}.\n\n' +
      'Requester: {{requester}}\n' +
      'Approver: {{approver}}\n\n' +
      'Thanks,\n{{org}}\nCEO: {{ceo}}'
  }
];
