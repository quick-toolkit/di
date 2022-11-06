# di
The @quick-toolkit/di a tiny inversion of control container for JavaScript.

[![npm (scoped)](https://img.shields.io/npm/v/@quick-toolkit/di)](https://www.npmjs.com/package/@quick-toolkit/di)

## Installing

```shell
npm i reflect-metadata @quick-toolkit/class-mirror @quick-toolkit/di
#or
yarn add reflect-metadata @quick-toolkit/class-mirror @quick-toolkit/di
```

## Example Usage

### Crate application

```ts
import {QDModule} from "../../src";

@QDModule({
  imports: [],
  providers: [],
  exports: [],
})
export class Application {
  public constructor() {}
}
```


### Import modules

> config.service.ts

```ts
import {QDInjectable} from "../../src";

@QDInjectable()
export class ConfigService {
  private name: string = "alice"
  public setName(name: string) {
    this.name = name;
  }
  public getName(): string {
    return this.name;
  }
}
```

> config.module.ts

```ts
import {QDModule} from "../../src";
import {ConfigService} from "./config.service";

@QDModule({
  // provider services
  providers: [ConfigService],
  exports: [ConfigService],
})
export class Config {
  constructor(private service: ConfigService) {
    service.getName() // alice
    service.setName('bob');
  }
}
```

```ts
import {assert} from 'chai';
import {QDModule} from "../../src";
import {Config} from "./config.module";
import {ConfigService} from "./config.service";

@QDModule({
  imports: [Config],
  providers: [],
  exports: [],
})
export class Application {
  public constructor(private configService: ConfigService, private config: Config) {
    configService.getName() // bob
  }
}

const app = EnvironmentInjector.run(Application);
asset.equal(app.configService, config.configService);
```



## Documentation
- [ApiDocs](https://quick-toolkit.github.io/di/)
- [samples](https://github.com/quick-toolkit/di/tree/master/sample)


## Issues
Create [issues](https://github.com/quick-toolkit/di/issues) in this repository for anything related to the Class Decorator. When creating issues please search for existing issues to avoid duplicates.


## License

```
/**
 * MIT License
 * Copyright (c) 2021 RanYunLong<549510622@qq.com> @quick-toolkit/di
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
```

Licensed under the [MIT](https://github.com/quick-toolkit/di/blob/master/LICENSE) License.
