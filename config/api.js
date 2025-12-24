
const ENV_URL = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const ENV_URL_PROD = (process.env.NEXT_PUBLIC_API_URL_PRODUCTION || "").trim();

// Remove trailing slashes, ensure protocol http/https
function sanitizeBaseUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    // Drop trailing slash
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.origin + (u.pathname === "/" ? "" : u.pathname);
  } catch (_) {
    return "";
  }
}

// Decide base URL
export const getApiUrl = () => {
  const fromEnv = sanitizeBaseUrl(ENV_URL);
  if (fromEnv) return fromEnv;

  // Optional secondary env for production deployments
  const fromEnvProd = sanitizeBaseUrl(ENV_URL_PROD);
  if (fromEnvProd) return fromEnvProd;

  return ""; // Return empty if no environment variable is configured
};

export const getApiName = () => (process.env.NODE_ENV === "production" ? "Configured API" : "Local/Configured API");

export const getAllApis = () => ({ active: getApiUrl() });

// Health check with timeout
export const checkApiHealth = async (url = getApiUrl(), timeoutMs = 4000) => {
  if (!url) return false;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}/api/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(t);
  }
};

export default { getApiUrl, getApiName, getAllApis, checkApiHealth };
