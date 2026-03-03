const CHAR_MAP = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function computeIcaoHex(nNumber: string): string | null {
  if (!nNumber) return null;
  let s = nNumber.toUpperCase().trim();
  if (s.startsWith("N")) s = s.substring(1);
  if (!s || s.length > 5) return null;

  const digits: number[] = [];
  let suffix = "";
  for (const ch of s) {
    if (ch >= "0" && ch <= "9" && suffix === "") {
      digits.push(parseInt(ch));
    } else {
      suffix += ch;
    }
  }

  if (digits.length === 0 || digits[0] === 0) return null;
  if (suffix.length > 2) return null;
  for (const ch of suffix) {
    if (CHAR_MAP.indexOf(ch) === -1) return null;
  }

  const totalBlock = [1, 35, 951, 10111, 101711];
  const suffixCount = [1, 25, 601, 601, 601];

  let offset = 0;
  offset += (digits[0] - 1) * totalBlock[4];

  for (let i = 1; i < digits.length; i++) {
    const rem = 5 - i;
    offset += suffixCount[rem];
    offset += digits[i] * totalBlock[rem - 1];
  }

  const rem = 5 - digits.length;
  if (suffix.length >= 1) {
    offset += 1;
    const idx1 = CHAR_MAP.indexOf(suffix[0]);
    if (rem >= 2) {
      offset += idx1 * 25;
      if (suffix.length === 2) {
        offset += 1;
        offset += CHAR_MAP.indexOf(suffix[1]);
      }
    } else {
      offset += idx1;
    }
  }

  const icao = 0xa00001 + offset;
  if (icao > 0xadf7c7) return null;
  return icao.toString(16).padStart(6, "0");
}
