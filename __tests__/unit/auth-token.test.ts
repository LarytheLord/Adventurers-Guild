import { encode, getToken } from 'next-auth/jwt';

describe('session token parsing', () => {
  const secret = 'test-session-secret-at-least-32-characters';

  it.each(['Bearer %', 'Bearer %E0%A4%A', 'Bearer invalid-token'])(
    'rejects malformed authorization without throwing: %s',
    async (authorization) => {
      await expect(
        getToken({ req: { headers: { authorization }, cookies: {} }, secret })
      ).resolves.toBeNull();
    }
  );

  it('reads a valid bearer session token', async () => {
    const token = await encode({ token: { sub: 'test-user' }, secret });

    await expect(
      getToken({
        req: { headers: { authorization: `Bearer ${token}` }, cookies: {} },
        secret,
      })
    ).resolves.toMatchObject({ sub: 'test-user' });
  });
});
