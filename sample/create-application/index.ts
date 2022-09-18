import {DefModule, Injector} from '../../src';

@DefModule({})
export class Application {
  public getName() {
    return 'Application';
  }
}