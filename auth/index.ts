import NextAuth from "next-auth";
import { authOptions } from "./config";

// Initialize a global undici proxy if HTTP(S)_PROXY is provided.
// This ensures Auth.js (and any server-side fetch) works behind corporate/region proxies
// e.g. when accessing Google OAuth endpoints from a restricted network.
try {
  // Lazy import to avoid bundling undici types into edge runtimes
  const { ProxyAgent, setGlobalDispatcher } = require("undici");
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy;
  if (proxyUrl) {
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
  }
} catch (_) {
  // undici not available or runtime doesn't support dispatcher; ignore silently
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
