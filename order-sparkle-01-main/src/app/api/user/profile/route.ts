export const dynamic = "force-dynamic";

import { routeAdapter } from '@/lib/apiAdapter';
import * as authController from '@/server/controllers/authController';

export async function GET(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, authController.getProfile, true);
}


export async function PUT(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, authController.updateProfile, true);
}
