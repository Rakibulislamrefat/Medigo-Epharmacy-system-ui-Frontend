import { getFrontendConfig } from "../config/frontend";

const backendBaseUrl = (apiBaseUrl: string) => apiBaseUrl.replace(/\/api(\/.*)?$/, "");

const Path: { readonly server: string; readonly client: string; readonly api: string } = {
  get server() {
    return backendBaseUrl(getFrontendConfig().apiBaseUrl);
  },
  get client() {
    return getFrontendConfig().frontendUrl;
  },
  get api() {
    return getFrontendConfig().apiBaseUrl;
  },
};

export default Path;
