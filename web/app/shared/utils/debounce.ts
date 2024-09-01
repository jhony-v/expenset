type DebounceFunction = (...args: any[]) => void;

export function debounce(
  func: DebounceFunction,
  delay: number
): DebounceFunction {
  let timeoutId: NodeJS.Timeout;

  return function (...args: any[]) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
