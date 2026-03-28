
import { routeAdapter } from '@/lib/apiAdapter';
import * as authController from '@/server/controllers/authController';

export async function POST(req: Request, context: any) {
  const params = context.params ? await context.params : {};
  return routeAdapter(req, params, authController.login, false);
}
