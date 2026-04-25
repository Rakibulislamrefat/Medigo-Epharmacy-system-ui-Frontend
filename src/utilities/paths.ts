const server = import.meta.env.VITE_SERVER_URL as string;
const client = import.meta.env.VITE_CLIENT_URL as string;
const api = import.meta.env.VITE_API_URL as string;

const Path: { server: string; client: string; api: string } = {
  server,
  client,
  api,
};

export default Path;
