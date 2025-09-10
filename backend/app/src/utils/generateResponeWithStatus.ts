export const getStatusOkResponse = (payload: Record<string, any> = {}) => ({
  status: 'ok',
  ...payload,
});

export const getStatusErrorResponse = (message: string) => ({
  status: 'error',
  message,
});
