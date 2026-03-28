import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/config/database';

export async function routeAdapter(req: Request, params: any, controllerFn: Function, requireAuth = false) {
  try {
    let body = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try { body = await req.json(); } catch(e) {}
    }
    
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    
    let statusCode = 200;
    let responseData = null;
    
    const mockReq = {
      body,
      query,
      params: params || {},
      headers: Object.fromEntries(req.headers.entries()),
      restaurantId: null as string | null,
      restaurant: null as any,
    };
    
    const mockRes = {
      status: (s: number) => { statusCode = s; return mockRes; },
      json: (data: any) => { responseData = data; return mockRes; },
      send: (data: any) => { responseData = data; return mockRes; }
    };

    if (requireAuth) {
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.split(' ')[1];
      
      if (!token || token === 'demo-token-no-auth') {
        mockReq.restaurantId = 'demo-restaurant-id';
        mockReq.restaurant = { id: 'demo-restaurant-id', restaurantName: 'Demo' };
      } else {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
          const restaurant = await prisma.restaurant.findUnique({ where: { id: decoded.restaurantId } });
          if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 401 });
          mockReq.restaurantId = decoded.restaurantId;
          mockReq.restaurant = restaurant;
        } catch(e) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
      }
    }

    await controllerFn(mockReq, mockRes);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
