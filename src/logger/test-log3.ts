import { Logger, IMeta, styleWrap } from 'tslog-fork';
import dayjs from 'dayjs';

const logger = new Logger({
  name: 'myLogger',
  type: 'pretty',
  overwrite: {
    formatMeta: (meta?: IMeta) => {
      // format LogObj meta object to a string and return it
      // console.log(typeof meta.date, meta.date.getTimezoneOffset());
      // console.log(meta);
      // console.log(dayjs().format('HH:mm:ss'));

      return `${styleWrap(dayjs().format('HH:mm:ss'), 'yellow')} ${styleWrap(
        meta.path.fileNameWithLine,
        'blackBright',
      )}  `;
    },
    /*
    formatLogObj: <LogObj>(maskedArgs: unknown[], settings: ISettings<LogObj>) => {
      // format LogObj attributes to a string and return it
    },
    transportFormatted: (logMetaMarkup: string, logArgs: unknown[], logErrors: string[], settings: unknown) => {
      // overwrite the default transport for formatted (e.g. pretty) log levels. e.g. replace console with StdOut, write to file etc.
    },
*/
  },
});

logger.info({ a: 'asdasd', b: { f: 223, jsx: 34 } }, 'asd');
console.log('*********');
logger.info(styleWrap('asd', 'red'));
