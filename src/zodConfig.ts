import { z } from 'zod';

// Enable jitless mode in Zod v4 to avoid dynamic codegen under strict CSP (no 'unsafe-eval').
z.config({ jitless: true });
