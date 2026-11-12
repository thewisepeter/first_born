import type { NextRequest } from 'next/server';
import { forwardCollection } from '../../_shared/forwardCollection';

export function GET(request: NextRequest) {
  return forwardCollection(request, 'opportunities');
}
