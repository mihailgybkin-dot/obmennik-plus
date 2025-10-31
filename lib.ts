
export function refCodeFromEmail(email: string) {
  const enc = new TextEncoder().encode(email.toLowerCase().trim());
  let h = 0;
  for (let i=0;i<enc.length;i++){ h = (h*31 + enc[i]) % 2147483647; }
  return h.toString(36);
}
