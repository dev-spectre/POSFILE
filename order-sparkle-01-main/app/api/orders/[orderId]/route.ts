
import { routeAdapter } from '@/lib/apiAdapter';
import * as orderController from '@/server/controllers/orderController';

export async function GET(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, orderController.getOrder, true);
}


export async function PUT(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, orderController.editOrder, true);
}
