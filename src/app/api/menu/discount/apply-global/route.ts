export const dynamic = "force-dynamic";

import { routeAdapter } from '@/lib/apiAdapter';
import * as menuController from '@/server/controllers/menuController';

export async function POST(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, menuController.applyGlobalDiscount, true);
}
