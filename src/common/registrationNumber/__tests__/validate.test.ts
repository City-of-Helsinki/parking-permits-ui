import Validate from '../validate';

describe('Test for car registration number validation', () => {
  const validate = new Validate();

  it('Empty car plate should fail', async () => {
    const result = validate.carLicensePlate('');
    expect(result).toBe(false);
  });

  it('Car plate with lower case should fail', async () => {
    const result = validate.carLicensePlate('abc-123');
    expect(result).toBe(false);
  });

  it('Car plate without an alphabetic character should fail', async () => {
    const result = validate.carLicensePlate('123');
    expect(result).toBe(false);
  });

  it('Car plate without a numeric character should fail', async () => {
    const result = validate.carLicensePlate('ABC');
    expect(result).toBe(false);
  });

  it('Car plate without separator of numeric and alpha character should fail', async () => {
    const result = validate.carLicensePlate('BCC1');
    expect(result).toBe(false);
  });

  it('Car plate too too much character should fail', async () => {
    const result = validate.carLicensePlate('ABC-123323');
    expect(result).toBe(false);
  });

  it('Normal reg ABC-123 should pass', async () => {
    const result = validate.carLicensePlate('ABC-123');
    expect(result).toBe(true);
  });

  it('Diplomat reg CD-123 should pass', async () => {
    const result = validate.carLicensePlate('CD-123');
    expect(result).toBe(true);
  });

  it('Free diplomat reg C-123 should pass', async () => {
    const result = validate.carLicensePlate('C-123');
    expect(result).toBe(true);
  });
});
