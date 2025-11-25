import type { FetchLike } from 'eventsource';

export const sseFetchWithCredentials: FetchLike = (input, init) => {
  // @ts-expect-error Clerk token outside React
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const token: string = await window.Clerk.session.getToken();

  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

export default sseFetchWithCredentials;
