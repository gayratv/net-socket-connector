export function delay(ms = 10_000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(0), ms);
  });
}

// ::ffff:127.0.0.1:51654
export function getPort(p: string): string {
  const i = p.lastIndexOf(':');
  if (i === -1) return '';
  return p.substring(i + 1);
}

// console.log(getPort('::ffff:127.0.0.1:51654'));

export function objectToString(objectExample: any) {
  if (typeof objectExample !== 'object') return objectExample.toString();

  let res = '';
  Reflect.ownKeys(objectExample).forEach((key) => {
    const data =
      typeof objectExample[key] === 'object'
        ? `{${objectToString(objectExample[key])}}`
        : objectExample[key].toString();
    res += ` ${key as string}:${data}`;
  });
  return res;
}

// const objectExample = { hello: '🌎', goodbye: '🌙', nested: { inner: '🐦' }, array: [37] };
// console.log(objectToString(objectExample));
