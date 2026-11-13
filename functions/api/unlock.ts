import { handleUnlock } from '../../src/server/unlock';
import type { Env } from '../../src/server/env';

export const onRequestGet = ({ request, env }: { request: Request; env: Env }) => handleUnlock(request, env);
