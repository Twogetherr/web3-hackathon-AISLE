export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: ApiErrorBody | null;
  meta: ApiMeta;
}
