import { injectable } from 'inversify';
import { Logger, TStyle } from 'tslog-fork';
import { ILogger } from '../logger.interface.js';
import 'reflect-metadata';
import { styleWrap as styleWrapSrc } from 'tslog-fork';

@injectable()
export class LoggerService implements ILogger {
  public logger: Logger<any>;

  constructor() {
    this.logger = new Logger<any>();
    this.logger.settings.stylePrettyLogs = true;
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
    this.logger.silly(...args);
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
