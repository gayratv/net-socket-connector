import { TStyle, styleWrap as styleWrapSrc, Logger } from 'tslog-fork';
import { ILogger, LoggerLevel } from './logger.interface.js';

// singleton
export class NLog implements ILogger {
  public logger: Logger<any>;
  private static instance: NLog;

  public static getInstance(): NLog {
    if (!NLog.instance) {
      NLog.instance = new NLog();
    }

    return NLog.instance;
  }
  private constructor() {
    this.logger = new Logger<any>({ stackDepthLevel: 6 });
    this.logger.settings.stylePrettyLogs = true;
    this.logger.settings.prettyInspectOptions = { colors: true, compact: true, sorted: false };
    this.logger.settings.prettyLogStyles = {
      logLevelName: {
        '*': ['bold', 'black', 'bgWhiteBright', 'dim'],
        SILLY: ['bold', 'white'],
        TRACE: ['bold', 'whiteBright'],
        DEBUG: ['bold', 'green'],
        INFO: ['bold', 'blue'],
        WARN: ['bold', 'yellow'],
        ERROR: ['bold', 'red'],
        FATAL: ['bold', 'redBright'],
      },
      dateIsoStr: 'white',
      filePathWithLine: 'white',
      name: ['white', 'bold'],
      nameWithDelimiterPrefix: ['white', 'bold'],
      nameWithDelimiterSuffix: ['white', 'bold'],
      errorName: ['bold', 'bgRedBright', 'whiteBright'],
      fileName: ['yellow'],
      fileNameWithLine: 'white',
    };
    this.logger.settings.prettyLogTemplate = '{{hh}}:{{MM}}:{{ss}} {{logLevelName}} [{{fileNameWithLine}}] ';
  }
  log(logLevel: number, ...args: unknown[]) {
    this.logger.log(logLevel, '', ...args);
  }
  silly(...args: unknown[]) {
    this.logger.log(LoggerLevel.silly, '', ...args);
  }
  trace(...args: unknown[]) {
    this.logger.trace(...args);
  }
  debug(...args: unknown[]) {
    this.logger.debug(...args);
  }
  info(...args: unknown[]) {
    this.logger.info(...args);
  }
  warn(...args: unknown[]) {
    this.logger.warn(...args);
  }
  error(...args: unknown[]) {
    this.logger.error(...args);
  }

  fatal(...args: unknown[]) {
    this.logger.fatal(...args);
  }
  sw(value: string, style: TStyle) {
    return styleWrapSrc(value, style);
  }
  set minLevel(n: number) {
    this.logger.settings.minLevel = n;
  }
  get minLevel() {
    return this.logger.settings.minLevel;
  }
}
