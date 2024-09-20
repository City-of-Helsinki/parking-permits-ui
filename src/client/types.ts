export type FetchError = {
  status?: number;
  error?: Error;
  message?: string;
};

export type FetchStatus =
  | 'unauthorized'
  | 'ready'
  | 'loading'
  | 'error'
  | 'loaded'
  | 'waiting';

export type ApiFetchError = FetchError | string | undefined;
