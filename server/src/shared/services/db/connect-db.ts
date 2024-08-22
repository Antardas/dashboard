import mongoose from 'mongoose';
import createLogger from '../../global/helpers/logger';
const logger = createLogger('database');
export default async function connectDB() {
	if (!process.env.DB_URL) {
		throw new Error('Database connection url not provided.');
	}

	// TODO: change it before set into production hard-coded -> env
	mongoose
		.connect(process.env.DB_URL!)
		.then(async () => {
			logger.info('Successfully Connected to the database');
			

			// console.log(
			// 	await mongoose.connection.db
			// 		?.collection('shopifyOrders')
			// 		.find(
			// 			{
			// 				id: { $in: [BigInt('47045082802125126'), BigInt('49061622352508745')] },
			// 			},
			// 			{
			// 				projection: {
			// 					shop: '$total_price_set.shop_money',
			// 					data: '$created_at'
			// 				},
			// 			}
			// 		)
			// 		.toArray()
			// );

			/* console.log(
				await mongoose.connection.db
					?.collection('shopifyOrders')
					.find(
						{},
						{
							projection: {
								created_at: 1,
							},
						}
					)
					.limit(10)
					.toArray()
			); */
		})
		.catch((error) => {
			logger.error('Error Connecting  to database', error);
			return process.exit(1);
		});

	mongoose.connection.on('disconnected', () => {});
}

/* 
{
  _id: new Long('65334540550690380'),
  id: new Long('65334540550690380'),
  email: 'idzz@gmail.org',
  closed_at: null,
  created_at: '2023-01-02T16:15:10+00:00',
  updated_at: '2023-01-02T16:15:10+00:00',
  number: 1234,
  note: null,
  token: '',
  gateway: 'shopify_payments',
  test: false,
  total_price: '1621.40',
  subtotal_price: '1474.00',
  total_weight: 0,
  total_tax: '147.40',
  taxes_included: true,
  currency: 'INR',
  financial_status: 'paid',
  confirmed: true,
  total_discounts: '0.00',
  buyer_accepts_marketing: false,
  name: '#10028920',
  referring_site: null,
  landing_site: null,
  cancelled_at: null,
  cancel_reason: null,
  reference: null,
  user_id: null,
  location_id: null,
  source_identifier: null,
  source_url: null,
  device_id: null,
  phone: null,
  customer_locale: 'en',
  app_id: 123456,
  browser_ip: '',
  landing_site_ref: null,
  order_number: new Long('65334540550690380'),
  discount_applications: [],
  discount_codes: [],
  note_attributes: [],
  payment_gateway_names: [ 'shopify_payments' ],
  processing_method: 'direct',
  source_name: 'web',
  fulfillment_status: null,
  tax_lines: [],
  tags: '',
  contact_email: null,
  order_status_url: '',
  presentment_currency: 'INR',
  total_line_items_price_set: {
    shop_money: { amount: '1474.00', currency_code: 'INR' },
    presentment_money: { amount: '1474.00', currency_code: 'INR' }
  },
  total_discounts_set: {
    shop_money: { amount: '0.00', currency_code: 'INR' },
    presentment_money: { amount: '0.00', currency_code: 'INR' }
  },
  total_shipping_price_set: {
    shop_money: { amount: '0.00', currency_code: 'INR' },
    presentment_money: { amount: '0.00', currency_code: 'INR' }
  },
  subtotal_price_set: {
    shop_money: { amount: '1474.00', currency_code: 'INR' },
    presentment_money: { amount: '1474.00', currency_code: 'INR' }
  },
  total_price_set: {
    shop_money: { amount: '1621.40', currency_code: 'INR' },
    presentment_money: { amount: '1621.40', currency_code: 'INR' }
  },
  total_tax_set: {
    shop_money: { amount: '147.40', currency_code: 'INR' },
    presentment_money: { amount: '147.40', currency_code: 'INR' }
  },
  line_items: [
    {
      id: new Long('25309368294432078'),
      variant_id: new Long('36534112974521935'),
      title: 'ufHTfRD',
      quantity: 1,
      sku: '',
      variant_title: 'Default Title',
      vendor: 'nUCoJ',
      fulfillment_service: 'manual',
      product_id: new Long('66506302814527302'),
      requires_shipping: true,
      taxable: true,
      gift_card: false,
      name: 'ufHTfRD - Default Title',
      variant_inventory_management: 'shopify',
      properties: [],
      product_exists: true,
      fulfillable_quantity: 1,
      grams: 0,
      price: 1474,
      total_discount: '0.00',
      fulfillment_status: null,
      price_set: [Object],
      total_discount_set: [Object],
      discount_allocations: [],
      duties: [],
      admin_graphql_api_id: 'gid://shopify/LineItem/25309368294432078'
    }
  ],
  shipping_lines: [],
  billing_address: null,
  shipping_address: null,
  fulfillments: [],
  client_details: null,
  refunds: [],
  customer: {
    id: new Long('16547342565062735'),
    email: 'idzz@gmail.org',
    created_at: '2021-08-19T13:06:26+00:00',
    updated_at: '2021-08-19T13:06:26+00:00',
    first_name: 'eEQIUm',
    last_name: 'AGntK',
    orders_count: 0,
    state: 'disabled',
    total_spent: '0.00',
    last_order_id: new Long('65334540550690380'),
    note: null,
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    phone: null,
    tags: '',
    last_order_name: '#10028920',
    currency: '',
    marketing_opt_in_level: null,
    tax_exemptions: [],
    admin_graphql_api_id: 'gid://shopify/Customer/16547342565062735',
    default_address: {
      id: new Long('37430242660522316'),
      customer_id: new Long('16547342565062735'),
      first_name: 'eEQIUm',
      last_name: 'AGntK',
      company: null,
      address1: '894 HrWgem TRX',
      address2: null,
      city: 'Corpus Christi',
      province: 'TX',
      country: 'UA',
      zip: '78401',
      phone: null,
      name: '',
      province_code: null,
      country_code: '',
      country_name: '',
      default: true
    }
  },
  total_line_items_price: '1474.00'
}
*/
