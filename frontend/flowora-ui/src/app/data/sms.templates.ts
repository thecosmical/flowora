export type SmsTemplate = {
  id: string;
  name: string;
  body: string;
};

export const SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'RFQ_INVENTORY_SMS',
    name: 'RFQ - Inventory Dispatch',
    body:
      'RFQ: Need {{qty}} units of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Please share best price and lead time. Contact: {{approver}}.'
  },
  {
    id: 'REMINDER_SMS',
    name: 'Reminder',
    body: 'Reminder: awaiting quotation for {{itemName}} ({{sku}}), qty {{qty}}. Please respond. - {{approver}}'
  },
  {
    id: 'RFQ_VENDOR_LONGFORM_SMS',
    name: 'RFQ - Vendor',
    body:
      'Hello {{vendor}}, need {{qty}} of {{itemName}} ({{sku}}) for Request {{requestId}}. ' +
      'Share best quote, taxes, lead time. Target: {{targetDate}}. Thanks, {{org}} (CEO: {{ceo}})'
  }
];
