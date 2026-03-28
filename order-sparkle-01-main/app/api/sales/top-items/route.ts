
import { routeAdapter } from '@/lib/apiAdapter';
import * as salesController from '@/server/controllers/salesController';

export async function GET(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, salesController.getTopSellingItems, true);
}
