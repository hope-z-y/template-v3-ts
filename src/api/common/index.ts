import { request } from "@/request";

/** Upload a file and return its public URL. */
export const UploadFile = (file: File) => {
  const data = new FormData();
  data.append("file", file);

  return request.post<string, string>("/upload", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
