export type SmsTemplate = {
  id: string;
  name: string;
  body: string;
};

export const SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'RFQ_INVENTORY_SMS',
    name: 'Request for Quotation from Suppliers - Inventory Dispatch',
    body:
      'Request for Quotation from Suppliers: need {{qty}} units of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Please share best price and lead time. Contact: {{approver}}.'
  },
  {
    id: 'REMINDER_SMS',
    name: 'Request for Quotation from Suppliers Reminder',
    body:
      'Reminder: Request for Quotation from Suppliers pending for {{itemName}} ({{sku}}), qty {{qty}}. Please respond. - {{approver}}'
  },
  {
    id: 'RFQ_VENDOR_LONGFORM_SMS',
    name: 'Request for Quotation from Suppliers - Vendor',
    body:
      'Hello {{vendor}}, Request for Quotation from Suppliers for {{qty}} of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Share best quote, taxes, lead time. Target: {{targetDate}}. Thanks, {{org}} (CEO: {{ceo}})'
  }
];
