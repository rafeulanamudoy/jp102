export type IpaginationOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
  export const paginationFileds = ["page", "limit", "sortBy", "sortOrder"];