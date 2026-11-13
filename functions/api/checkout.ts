import { handleCheckout } from '../../src/server/checkout';
import type { Env } from '../../src/server/env';

export const onRequestPost = ({ request, env }: { request: Request; env: Env }) => handleCheckout(request, env);
