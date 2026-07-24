// Fisher-Yates shuffle — returns a new array, doesn't mutate the input.
// Used to rotate which products appear first so the same items don't always show up on top.
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
