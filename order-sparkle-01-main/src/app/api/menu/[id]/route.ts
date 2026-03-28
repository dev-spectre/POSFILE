export const dynamic = "force-dynamic";

import { routeAdapter } from '@/lib/apiAdapter';
import * as menuController from '@/server/controllers/menuController';

export async function PUT(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, menuController.updateMenuItem, true);
}


export async function DELETE(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, menuController.deleteMenuItem, true);
}
