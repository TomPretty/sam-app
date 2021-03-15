import { useEffect, useState } from "react";

export const useOnce = (effect: () => void, deps: unknown[]): void => {
  const [hasBeenUsed, setHasBeenUsed] = useState(false);

  useEffect(() => {
    if (!hasBeenUsed && deps.every((dep) => dep !== undefined)) {
      effect();
      setHasBeenUsed(true);
    }
  }, [...deps]);
};
