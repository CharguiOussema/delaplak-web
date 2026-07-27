export type PaginationResponse<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: null | number;
  hasPrevPage: boolean;
  prevPage: null | number;
};

export type FilterOption = { label: string; value: string };

export type PartialNull<T> = {
  [P in keyof T]: T[P] | null;
};
