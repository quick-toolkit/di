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

import { ClassMirror, ParameterDecorate } from '@quick-toolkit/class-mirror';
import { Injector } from '../injector';
import { Provider, ProviderToken, StaticProvider, Type } from '../interfaces';
import { QDModuleDecorate } from '../decorators';

/**
 * @author RanYunLong<549510622@qq.com>
 * @class BaseInjector
 */
export class EnvironmentInjector extends Injector {
  private static $scope: Map<Symbol, Map<Type<any>, EnvironmentInjector>> =
    new Map();

  public static $collection: Map<object, Symbol> = new Map();

  public static parameterDecorateTokens: Map<
    Type<ParameterDecorate>,
    (decorate: ParameterDecorate) => ProviderToken<any>
  > = new Map();

  /**
   * @function providers
   * Handler providers
   * @param providers
   */
  public static providers(providers: Provider[]): StaticProvider[] {
    return providers.map<StaticProvider>((provider) => {
      const { provide, useFactory, useClass, useValue, deps } =
        provider as StaticProvider;
      const _: Partial<StaticProvider> = {
        provide: provide || provider,
      };
      if (useValue) {
        _.useValue = useValue;
      } else if (useFactory) {
        _.useFactory = useFactory;
      } else if (useClass) {
        _.provide = provide || useClass;
        _.useClass = useClass;
      } else if (provider instanceof Function) {
        _.provide = provide || provider;
        _.useClass = provider;
      } else if (provide instanceof Function) {
        _.provide = provide;
        _.useClass = provide;
      }
      _.deps = deps;
      return _ as StaticProvider;
    });
  }

  /**
   * @function reflect
   * @param module
   * @param scope
   */
  public static reflect<T>(
    module: Type<T>,
    scope: Symbol
  ): EnvironmentInjector {
    const $scope = EnvironmentInjector.$scope.get(scope);
    if ($scope) {
      const _m = $scope.get(module);
      if (_m) {
        return _m;
      }
    }
    const reflect = ClassMirror.reflect(module);
    const decorates = reflect.getDecorates(QDModuleDecorate);
    const parameters = reflect.getParameters();
    const _providers: Set<Provider> = new Set();
    const _imports: Set<Type<any>> = new Set();
    const _exports: Set<Provider> = new Set();
    decorates.forEach((decorate) => {
      if (decorate.metadata) {
        const {
          imports = [],
          providers = [],
          exports = [],
        } = decorate.metadata;
        for (const _ of providers) {
          _providers.add(_);
        }
        for (const _ of imports) {
          _imports.add(_);
        }
        for (const _ of exports) {
          _exports.add(_);
        }
      }
    });
    _imports.forEach((_) => {
      const injector = EnvironmentInjector.reflect(_, scope);
      injector.exports.forEach((staticProvider) => {
        _providers.add({
          provide: staticProvider.provide,
          useFactory: () => injector.get(staticProvider.provide),
        });
      });
      _providers.add({
        provide: _,
        useFactory: () => injector.get(_),
      });
    });
    const deps: ProviderToken<any>[] = [];
    parameters.forEach((parameterMirror) => {
      deps[parameterMirror.index] = parameterMirror.getDesignParamType() as any;
      EnvironmentInjector.parameterDecorateTokens.forEach((v, t) => {
        const parameterDecorates = parameterMirror.getDecorates(t);
        if (parameterDecorates) {
          for (const decorate of parameterDecorates) {
            const token = v(decorate);
            if (token !== undefined && token !== null) {
              deps[parameterMirror.index] = token;
            }
          }
        }
      });
    });
    _providers.add({
      provide: module,
      deps,
    });
    const injector = new EnvironmentInjector(Array.from(_providers));
    injector.exports = EnvironmentInjector.providers(Array.from(_exports));
    const injectors = EnvironmentInjector.$scope.get(scope) || new Map();
    injectors.set(module, injector);
    EnvironmentInjector.$scope.set(scope, injectors);
    return injector;
  }

  /**
   * @function run
   * Run application
   */
  public static run<T extends {}>(application: Type<T>, scope?: Symbol): T {
    const $scope = scope || Symbol(application.name);
    const app = EnvironmentInjector.reflect(application, $scope).get(
      application
    ) as T;
    EnvironmentInjector.$collection.set(app, $scope);
    return app;
  }

  public exports: StaticProvider[] = [];

  /**
   * constructor
   * @param providers
   */
  public constructor(providers: Provider[]) {
    super(EnvironmentInjector.providers(providers));
  }
}
