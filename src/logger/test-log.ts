import { Logger } from 'tslog-fork';
import chalk from 'chalk';

const logger = new Logger({ name: 'myLogger' });
logger.silly('I am a silly log.');
logger.trace('I am a trace log.');
logger.debug('I am a debug log.');
logger.info('I am an info log.');
logger.warn('I am a warn log with a json object:', { foo: 'bar' });
logger.error('I am an error log.');
logger.fatal(new Error('I am a pretty Error with a stacktrace.'));
logger.trace('I am a trace log.');
logger.trace(
  `Attachable transports: Send logs to an external log aggregation services, file system, database, or email/slack/sms/you name it...`,
);

console.log('---------------');
const mainLogger = new Logger({ type: 'pretty', name: 'MainLogger' });
mainLogger.silly('foo bar');

const firstSubLogger = mainLogger.getSubLogger({ name: 'FirstSubLogger' });
firstSubLogger.silly('foo bar 1');

console.log('******************');
// visible
logger.log(1, 'level_one', 'LOG1');
// visible
logger.log(2, 'level_two', 'LOG2');

// change minLevel to 2
logger.settings.minLevel = 2;

// hidden
logger.log(1, 'level_one', 'LOG3');
// visible
// logger.settings.hideLogPositionForProduction = true;
logger.settings.stylePrettyLogs = true;
logger.settings.prettyLogStyles = {
  logLevelName: {
    '*': ['bold', 'blue', 'bgWhiteBright', 'dim'],

    SILLY: ['bold', 'white'],
    TRACE: ['bold', 'whiteBright'],
    DEBUG: ['bold', 'green'],
    INFO: ['white'],
    WARN: ['bold', 'yellow'],
    ERROR: ['bold', 'red'],
    FATAL: ['bold', 'redBright'],
  },
  dateIsoStr: 'blue',
  name: ['white', 'bold'],
  errorName: ['bold', 'bgRedBright', 'whiteBright'],
  fileNameWithLine: ['yellow'],
};
// logger.settings.prettyLogTemplate = '{{hh}}:{{MM}}:{{ss}}  {{logLevelName}}>>[{{fileNameWithLine}}]\t';
logger.settings.prettyLogTemplate = '{{hh}}:{{MM}}:{{ss}}  [{{fileNameWithLine}}] ';
logger.log(2, 'level_two', 'LOG4');
logger.debug('asd');
logger.info('aaswd asd asdsd');
logger.info(chalk.red('aaswd asd asdsd'));
