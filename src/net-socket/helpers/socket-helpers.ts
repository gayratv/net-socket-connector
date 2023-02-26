import { MESSAGE_SEPARATOR } from '../types/net-socket-types.js';

export function splitMessages(s: string) {
  const msgArray = s.split(MESSAGE_SEPARATOR);
  if (msgArray[msgArray.length - 1] === '') msgArray.length -= 1;
  return msgArray;
}
