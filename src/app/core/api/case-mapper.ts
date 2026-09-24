export function isObject(item: unknown): item is Record<string, unknown> {
  return (
    item !== null &&
    typeof item === 'object' &&
    !Array.isArray(item) &&
    !(item instanceof Date) &&
    !(typeof File !== 'undefined' && item instanceof File) &&
    !(typeof Blob !== 'undefined' && item instanceof Blob) &&
    !(typeof FormData !== 'undefined' && item instanceof FormData)
  );
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function keysToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (isObject(obj)) {
    const snakeObj: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      snakeObj[camelToSnake(key)] = keysToSnake(obj[key]);
    });
    return snakeObj;
  }
  return obj;
}

export function keysToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }
  if (isObject(obj)) {
    const camelObj: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      camelObj[snakeToCamel(key)] = keysToCamel(obj[key]);
    });
    return camelObj;
  }
  return obj;
}

export function resolveMediaUrl(url: string | null | undefined, apiBaseUrl?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (!apiBaseUrl) {
    return url;
  }
  try {
    const api = new URL(apiBaseUrl);
    const origin = `${api.protocol}//${api.host}`;
    return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
  } catch {
    return url;
  }
}
