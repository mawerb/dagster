const LOCAL_STORAGE_KEY = 'dagster-browser-id';

type BrowserIdOptions = {
  createIfMissing?: boolean;
};

export const getBrowserId = (options: BrowserIdOptions = {}) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const {createIfMissing = true} = options;

  try {
    const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    if (!createIfMissing) {
      return null;
    }

    const id = `browser-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, id);
    return id;
  } catch {
    return null;
  }
};
