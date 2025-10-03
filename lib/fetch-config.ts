import { ProxyAgent } from "undici";

/**
 * 为 NextAuth 配置代理 fetch
 * 参考: https://authjs.dev/guides/corporate-proxy
 */
export function createProxyFetch() {
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy;

  if (!proxyUrl) {
    // 无代理时使用原生 fetch
    return fetch;
  }

  const proxyAgent = new ProxyAgent(proxyUrl);

  return async (url: string | URL | Request, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      // @ts-ignore - undici ProxyAgent dispatcher
      dispatcher: proxyAgent,
    });
  };
}
