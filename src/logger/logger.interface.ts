import { TStyle, styleWrap as styleWrapSrc, Logger } from 'tslog-fork';

export enum LoggerLevel {
  silly,
  trace,
  debug,
  info,
  warn,
  error,
  fatal,
}

export interface ILogger {
  logger: unknown;
  log: (logLevelId: number, ...args: unknown[]) => void;
  silly: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  /**
   * Logs a fatal message.
   * @param args  - Multiple log attributes that should be logged out.
   */
  fatal: (...args: unknown[]) => void;

  /*
   * styleWrap - выводит текст в цвете
   */
  sw(value: string, style: TStyle): string;

  set minLevel(n: LoggerLevel);
  get minLevel();
  /*
  minLevel
  Default severities are:
`  0: silly`, `1: trace`, `2: debug`, `3: info`, `4: warn`, `5: error`, `6: fatal`

   */
}
