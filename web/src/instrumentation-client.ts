// Vercel BotID: an invisible challenge attached to the storefront's POST
// endpoints. Server routes verify it via guard() in src/lib/guard.ts.
import { initBotId } from "botid/client/core";

try {
  initBotId({
    protect: [
      { path: "/api/checkout", method: "POST" },
      { path: "/api/wholesale/order", method: "POST" },
      { path: "/api/wholesale/artwork", method: "POST" },
      { path: "/api/newsletter", method: "POST" },
    ],
  });
} catch { /* never block the storefront on bot protection */ }
