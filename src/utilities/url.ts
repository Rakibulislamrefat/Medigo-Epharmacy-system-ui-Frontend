import Path from "./paths";


export const getImageUrl = (filename: string): string =>
  `${Path.server}/files/${filename}`;
