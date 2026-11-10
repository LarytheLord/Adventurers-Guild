// eslint-disable-next-line @typescript-eslint/no-require-imports
const { evaluate } = require('../../.github/scripts/pr-issue-link-check.cjs');

const OWNER = 'LarytheLord';

function pr(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Fix something',
    body: '',
    user: { login: 'some-contributor' },
    labels: [],
    ...overrides,
  };
}

describe('pr-issue-link-check evaluate()', () => {
  describe('closing reference', () => {
    it('passes when the body contains "Closes #N"', () => {
      expect(evaluate(pr({ body: 'Closes #123' }), OWNER).ok).toBe(true);
    });

    it('passes for other closing keywords and issue URLs', () => {
      expect(evaluate(pr({ body: 'Fixes #7' }), OWNER).ok).toBe(true);
      expect(evaluate(pr({ body: 'resolved: #7' }), OWNER).ok).toBe(true);
      expect(
        evaluate(
          pr({ body: 'Closes https://github.com/LarytheLord/Adventurers-Guild/issues/9' }),
          OWNER
        ).ok
      ).toBe(true);
    });

    it('passes when the reference is in the title', () => {
      expect(evaluate(pr({ title: 'Closes #5: typo' }), OWNER).ok).toBe(true);
    });

    it('fails when there is no reference, label, or owner', () => {
      const result = evaluate(pr({ body: 'Just a change' }), OWNER);
      expect(result.ok).toBe(false);
      expect(result.reason).toMatch(/Closes #123/);
    });

    it('fails for a bare issue number with no keyword', () => {
      expect(evaluate(pr({ body: 'See #123' }), OWNER).ok).toBe(false);
    });

    it('handles null body', () => {
      expect(evaluate(pr({ body: null }), OWNER).ok).toBe(false);
    });
  });

  describe('no-issue label', () => {
    it('passes when the PR has the "no-issue" label', () => {
      expect(evaluate(pr({ labels: [{ name: 'no-issue' }] }), OWNER).ok).toBe(true);
    });

    it('matches the label case-insensitively', () => {
      expect(evaluate(pr({ labels: [{ name: 'No-Issue' }] }), OWNER).ok).toBe(true);
    });

    it('does not pass for unrelated labels', () => {
      expect(evaluate(pr({ labels: [{ name: 'bug' }, { name: 'no-issues' }] }), OWNER).ok).toBe(
        false
      );
    });

    it('handles a missing labels field', () => {
      expect(evaluate(pr({ labels: undefined }), OWNER).ok).toBe(false);
    });
  });

  describe('repo owner', () => {
    it('passes when the author is the repo owner', () => {
      expect(evaluate(pr({ user: { login: 'LarytheLord' } }), OWNER).ok).toBe(true);
    });

    it('compares the login case-insensitively', () => {
      expect(evaluate(pr({ user: { login: 'larythelord' } }), OWNER).ok).toBe(true);
    });

    it('does not pass for a different author', () => {
      expect(evaluate(pr({ user: { login: 'LarytheLord2' } }), OWNER).ok).toBe(false);
    });

    it('handles a missing user and missing owner', () => {
      expect(evaluate(pr({ user: undefined }), OWNER).ok).toBe(false);
      expect(evaluate(pr({ user: undefined }), undefined).ok).toBe(false);
    });
  });
});
