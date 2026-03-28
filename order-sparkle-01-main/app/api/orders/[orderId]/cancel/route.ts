export const dynamic = "force-dynamic";

import { routeAdapter } from '@/lib/apiAdapter';
import * as orderController from '@/server/controllers/orderController';

export async function POST(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, orderController.cancelOrder, true);
}
