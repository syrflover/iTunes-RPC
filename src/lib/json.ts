export const parseJSON = <T>(s: string): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      const a = JSON.parse(s);
      resolve(a);
    } catch (e) {
      reject(e);
    }
  });

export const stringifyJSON = (s: any): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const a = JSON.stringify(s);
      resolve(a);
    } catch (e) {
      reject(e);
    }
  });
