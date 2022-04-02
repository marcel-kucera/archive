export const apiUrl = "http://localhost:8080";
export const uploadUrl = apiUrl + "/upload";
export const downloadUrl = (id: string) => `${apiUrl}/download?id=${id}`;
