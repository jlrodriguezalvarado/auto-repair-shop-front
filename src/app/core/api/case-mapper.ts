export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function keysToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }
  if (isObject(obj)) {
    const snakeObj: any = {};
    Object.keys(obj).forEach(key => {
      const snakeKey = camelToSnake(key);
      snakeObj[snakeKey] = keysToSnake(obj[key]);
    });
    return snakeObj;
  }
  return obj;
}

export function keysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }
  if (isObject(obj)) {
    const camelObj: any = {};
    Object.keys(obj).forEach(key => {
      const camelKey = snakeToCamel(key);
      camelObj[camelKey] = keysToCamel(obj[key]);
    });
    return camelObj;
  }
  return obj;
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return url;
  }
  return `/media/${url}`;
}
