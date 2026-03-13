export type AsyncState<T> = {
  loading: boolean;
  data: T;
  error: string | null;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  items: T[];
  totalCount: number;
};
