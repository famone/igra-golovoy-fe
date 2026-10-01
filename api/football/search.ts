import { proxyFootball } from './_proxy';

export const config = {
  runtime: 'edge',
};

export default function handler(request: Request): Promise<Response> {
  return proxyFootball(request, 'search');
}
