import { reqHandler } from '../dist/akitukuymi/server/server.mjs';

export default function handler(req, res) {
  const { searchParams } = new URL(req.url, 'http://localhost');
  const originalPath = searchParams.get('__path') || '/';
  req.originalUrl = originalPath;
  return reqHandler(req, res);
}
