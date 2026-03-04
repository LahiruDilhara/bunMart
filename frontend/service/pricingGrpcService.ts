import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { promisify } from 'util';

const PROTO_PATH = path.join(process.cwd(), 'proto/pricing.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const pricingPackage = protoDescriptor.pricing.v1;

class PricingGrpcService {
  private client: any;
  
  constructor() {
    this.client = new pricingPackage.PricingService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );
  }

  async getPrices(productIds: string[]) {
    const getPrices = promisify(this.client.getPrices.bind(this.client));
    const response = await getPrices({ product_ids: productIds });
    return response;
  }

  async getDiscounts(productIds: string[], userId?: string, couponCode?: string) {
    const getDiscounts = promisify(this.client.getDiscounts.bind(this.client));
    const response = await getDiscounts({
      product_ids: productIds,
      user_id: userId || '',
      coupon_code: couponCode || '',
    });
    return response;
  }

  async calculatePrice(productId: string, quantity: number, couponCode?: string, userId?: string) {
    const calculatePrice = promisify(this.client.calculatePrice.bind(this.client));
    const response = await calculatePrice({
      product_id: productId,
      quantity,
      coupon_code: couponCode || '',
      user_id: userId || '',
    });
    return response;
  }

  async calculateOrderPricing(items: Array<{ productId: string; quantity: number }>, userId?: string, couponCodes?: string[]) {
    const calculateOrderPricing = promisify(this.client.calculateOrderPricing.bind(this.client));
    const response = await calculateOrderPricing({
      items: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      user_id: userId || '',
      coupon_codes: couponCodes || [],
    });
    return response;
  }
}

export const pricingGrpcService = new PricingGrpcService();