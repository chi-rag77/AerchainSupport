export const getPasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) {
    strength += 1;
  }
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
    strength += 1;
  }
  if (password.match(/[0-9]/)) {
    strength += 1;
  }
  if (password.match(/[^a-zA-Z0-9]/)) {
    strength += 1;
  }

  return strength; // Returns a value from 0 to 4
};