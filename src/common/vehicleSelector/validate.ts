// Refs: https://github.com/pear/Validate_FI/blob/master/Validate/FI.php
class Validate {
  regMatch = (regRex: RegExp, value: string): RegExpMatchArray | null =>
    value.match(regRex);

  carLicensePlate($number: string): boolean {
    // diplomat licence plate
    if (this.regMatch(/^CD-[1-9]{1}[0-9]{0,3}$/, $number)) {
      return true;
    }
    // other tax-free diplomat licence plate
    if (this.regMatch(/^C-[1-9]{1}[0-9]{0,4}$/, $number)) {
      return true;
    }
    // regular licence plate
    return !!this.regMatch(/^[A-ZÅÄÖ]{2,3}-[1-9]{1}[0-9]{0,2}$/, $number);
  }
}
export default Validate;
