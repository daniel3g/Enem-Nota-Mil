import axios from "axios";

function cleanEnv(value?: string) {
  if (!value) return undefined;

  return value
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

const baseURL = cleanEnv(process.env.ASAAS_BASE_URL);
const accessToken = cleanEnv(process.env.ASAAS_API_KEY);

export const asaas = axios.create({
  baseURL,
  headers: {
    access_token: accessToken ?? "",
    "Content-Type": "application/json",
    "User-Agent": "enem-nota-mil-oficial",
  },
});

export const asaasEnvDebug = {
  baseURL,
  accessTokenLength: accessToken?.length ?? 0,
  accessTokenPrefix: accessToken?.slice(0, 6) ?? "",
  accessTokenSuffix: accessToken?.slice(-6) ?? "",
  hasLeadingBackslash: accessToken?.startsWith("\\$") ?? false,
  hasLeadingDollar: accessToken?.startsWith("$") ?? false,
  hasWhitespace: accessToken ? /\s/.test(accessToken) : false,
};
