import { Container, ContainerModule, interfaces, inject, injectable } from 'inversify';
import { Iversify } from '../../inversify/types.js';
import type { ILogger } from '../logger.interface.js';
import { LoggerService } from './logger.injectable.service.js';

export interface IBootstrapReturn {
  appContainer: Container;
  app: App;
}
export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(Iversify.ILogger).to(LoggerService).inSingletonScope();
  bind<App>(Iversify.Application).to(App).inSingletonScope();
  // bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
});

@injectable()
export class App {
  constructor(@inject(Iversify.ILogger) private logger: ILogger) {
    // this.app = express();
    // this.port = 8000;
  }
  tst() {
    this.logger.info('============== asdqa ----------------\nasd');
  }
}
async function bootstrap(): Promise<IBootstrapReturn> {
  const appContainer = new Container();
  appContainer.load(appBindings);
  const app = appContainer.get<App>(Iversify.Application);
  app.tst();
  return { appContainer, app };
}

await bootstrap();
