const MessageToServerKeys = ['type', 'queryIndex', 'payload'];
export function validateMsgToServer(o: any) {
  if (typeof o !== 'object') return false;
  const keys = Reflect.ownKeys(o);
  // разрешены только определенные ключи
  if (!keys.every((value: string) => MessageToServerKeys.includes(value))) return false;
  // 'type', 'queryIndex' должны быть в объекте
  if (!['type', 'queryIndex'].every((value) => value in o)) return false;
  if (typeof o.type !== 'string') return false;
  if (typeof o.queryIndex !== 'number') return false;
  return true;
}

// console.log(validateMsgToServer({ type: '1', queryIndex: 1 }));
