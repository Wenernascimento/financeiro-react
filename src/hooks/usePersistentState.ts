 import { useEffect, useState } from "react";

const STORAGE_VERSION = "finance_app_v3";

function storageAvailable(type: "localStorage" | "sessionStorage") {
  try {
    const storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const fullKey = `${STORAGE_VERSION}_${key}`;
  const [state, setState] = useState<T>(() => {
    try {
      if (!storageAvailable("localStorage")) {
        console.warn("localStorage não está disponível");
        return defaultValue;
      }

      const storedValue = localStorage.getItem(fullKey);
      if (storedValue === null) return defaultValue;

      return JSON.parse(storedValue);
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      localStorage.removeItem(fullKey);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (!storageAvailable("localStorage")) {
        console.warn("localStorage não está disponível para salvar");
        return;
      }

      const serialized = JSON.stringify(state);
      localStorage.setItem(fullKey, serialized);
      sessionStorage.setItem(fullKey, serialized);
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);

      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        localStorage.removeItem(`${STORAGE_VERSION}_temp`);
      }
    }
  }, [state, fullKey]);

  return [state, setState];
}
