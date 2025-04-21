export function getAxiosStatus(err: unknown): number | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { status?: number } }).response;
    if (response && typeof response.status === 'number') {
      return response.status;
    }
  }
  return undefined;
}
