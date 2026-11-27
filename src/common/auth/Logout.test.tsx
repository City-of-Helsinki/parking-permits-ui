import { getUserDisplayName } from './Logout';

describe('getUserDisplayName', () => {
  it('prefers the name claim', () => {
    expect(getUserDisplayName({ name: 'Jane Doe' }, 'User')).toBe('Jane Doe');
  });

  it('uses the given and family name when the name claim is missing', () => {
    expect(
      getUserDisplayName({ given_name: 'Jane', family_name: 'Doe' }, 'User')
    ).toBe('Jane Doe');
  });

  it('falls back to the preferred username and generic label', () => {
    expect(getUserDisplayName({ preferred_username: 'jdoe' }, 'User')).toBe(
      'jdoe'
    );
    expect(getUserDisplayName({}, 'User')).toBe('User');
  });
});
