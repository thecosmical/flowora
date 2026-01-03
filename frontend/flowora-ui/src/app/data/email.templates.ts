export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'RFQ_INVENTORY_EMAIL',
    name: 'Request for Quotation from Suppliers - Inventory Dispatch',
    subject: 'Request for Quotation from Suppliers: {{itemName}} ({{sku}}) - Qty {{qty}}',
    body:
      'Hello,\n\nRequest for Quotation from Suppliers: we need {{qty}} units of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Please share your best quotation, taxes, and lead time. Target delivery: {{dueDate}}.\n\n' +
      'Requester: {{requester}}\nApprover: {{approver}}\n\nThanks,\nFlowora Team'
  },
  {
    id: 'REMINDER_EMAIL',
    name: 'Request for Quotation from Suppliers Reminder',
    subject: 'Reminder: Request for Quotation from Suppliers pending for {{itemName}} ({{sku}})',
    body:
      'Hi,\n\nGentle reminder that the Request for Quotation from Suppliers is pending for {{itemName}} ({{sku}}), qty {{qty}}. ' +
      'Request ID: {{requestId}}.\n\nThanks,\nFlowora Team'
  },
  {
    id: 'RFQ_VENDOR_LONGFORM',
    name: 'Request for Quotation from Suppliers - Vendor Longform',
    subject: 'Request for Quotation from Suppliers: {{itemName}} ({{sku}}) - Qty {{qty}}',
    body:
      'Hello {{vendor}},\n\n' +
      'Request for Quotation from Suppliers: we need {{qty}} units of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Please share your best quotation, taxes, and lead time. Target delivery: {{targetDate}}.\n\n' +
      'Requester: {{requester}}\n' +
      'Approver: {{approver}}\n\n' +
      'Thanks,\n{{org}}\nCEO: {{ceo}}'
  }
];
