import { forwardListingWrite } from '../../forwardWrite';

export function PATCH(request: Request, { params }: { params: { id: string } }) {
  return forwardListingWrite(request, params.id);
}
