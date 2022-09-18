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

import { Injector } from '../index';
import {
  AbstractType,
  LookupDecorates,
  Provider,
  ProviderInfo,
  ProviderToken,
  StaticProvider,
  Type,
} from '../../interfaces/provider';
import { ClassMirror, MethodMirror } from '@quick-toolkit/class-mirror';
import { DefModuleDecorate } from '../../decorators/def-module/decorate';
import { InjectDecorate } from '../../decorators/inject/decorate';
import { Host } from '../../host';

const hosts = new Map<Injector, Host>();

/**
 * @class EnvironmentInjector
 */
export class EnvironmentInjector implements Injector {
  /**
   * Lookup decorators
   * @public
   * @param target
   */
  public static lookupDecorators<T>(
    target: Type<T> | AbstractType<T>
  ): LookupDecorates {
    const mirrors = ClassMirror.reflect(target);
    const decorates = mirrors.getDecorates(DefModuleDecorate);
    const providers: Set<Provider> = new Set();
    const imports: Set<Type<any>> = new Set();
    const exports: Set<Provider> = new Set();
    const deps: Map<number, ProviderToken<any>> = new Map();
    const parameters = mirrors.getParameters();
    if (parameters) {
      parameters.forEach((mirror) => {
        const injects = mirror.getDecorates(InjectDecorate);
        const design = mirror.getDesignParamType();
        if (design) {
          deps.set(mirror.index, design as Type<any>);
        }
        if (injects.length) {
          injects.forEach((i) => {
            if (i.metadata) {
              deps.set(mirror.index, i.metadata);
            }
          });
        }
      });
    }
    decorates.map((o) => {
      if (o.metadata) {
        const { metadata } = o;
        if (Array.isArray(metadata.providers)) {
          metadata.providers.forEach((p) => providers.add(p));
        }
        if (Array.isArray(metadata.imports)) {
          metadata.imports.forEach((i) => imports.add(i));
        }
        if (Array.isArray(metadata.exports)) {
          metadata.exports.forEach((e) => exports.add(e));
        }
      }
    });
    return { providers, imports, exports, deps };
  }

  /**
   * @internal
   * @private
   * @param target
   * @param parent
   * @param decorates
   */
  protected static createInjectorByDecorate<T>(
    target: Type<T> | AbstractType<T>,
    parent: Injector,
    decorates: LookupDecorates
  ): Injector {
    const { providers, imports, exports, deps } = decorates;
    const host = hosts.get(parent) || new Host();
    hosts.set(parent, host);
    const { scopeDeps, scopeInjectors, scopeExports, invokeDeps, scopes } =
      host;
    scopeDeps.set(target, imports);

    const injector =
      (scopeInjectors.get(target) as EnvironmentInjector) ||
      (Injector.create({
        providers: Array.from(providers),
        name: target.name,
        parent,
      }) as EnvironmentInjector);

    injector.providers.set(Injector, injector);
    injector.providers.set(EnvironmentInjector, injector);

    scopeInjectors.set(target, injector);

    if (imports.size) {
      imports.forEach((i) => {
        if (i === undefined) {
          throw Error(
            `Decorator prop invalid\n    at @DefModule({imports: [InvalidModule]})\n    at class ${target.name} circular dependency`
          );
        }
        EnvironmentInjector.createInjector(i, parent);
        const _exports = scopeExports.get(i);
        if (_exports) {
          _exports.forEach((value, key) => {
            injector.providers.set(key, value);
          });
        }
      });
    }

    if (exports.size) {
      const map = new Map();
      exports.forEach((provider: Provider) => {
        const token = injector.staticProviders.get(provider);
        if (!token) {
          const { staticProviders } = EnvironmentInjector.lookupProviders([
            provider,
          ]);
          const token = staticProviders.get(provider);
          throw new Error(
            `The module "${target.name}" is not provide: "${
              (token as any).name
            }".`
          );
        }
        map.set(provider, injector.get(token));
      });
      scopeExports.set(target, map);
    }

    if (deps) {
      invokeDeps.set(target, deps);
    }

    scopes.set(target, undefined);
    return injector;
  }

  /**
   * CreateInjector by constructor
   * @param target
   * @param root
   */
  public static createInjector<T>(
    target: Type<T> | AbstractType<T>,
    root: Injector
  ): Injector {
    return EnvironmentInjector.createInjectorByDecorate(
      target,
      root,
      EnvironmentInjector.lookupDecorators(target)
    );
  }

  /**
   * Invoke instance
   * @public
   * @param target
   * @param injector
   * @param deps
   */
  public static construct<T>(
    target: Type<T>,
    injector: EnvironmentInjector,
    deps?: ProviderToken<any>[]
  ): T {
    const host = hosts.get(injector.parent || injector) || new Host();
    hosts.set(injector.parent || injector, host);
    const args: any[] = [];
    const _deps = host.invokeDeps.get(target);
    if (_deps) {
      _deps.forEach((v, i) => {
        args[i] = injector.get(v);
      });
    } else if (deps) {
      args.push(...deps.map((o) => injector.get(o)));
    } else {
      const parameters = ClassMirror.reflect(target).getParameters();
      const deps: Map<number, ProviderToken<any>> = new Map();
      if (parameters) {
        parameters.forEach((mirror) => {
          const injects = mirror.getDecorates(InjectDecorate);
          const design = mirror.getDesignParamType();
          if (design) {
            deps.set(mirror.index, design as Type<any>);
          }
          if (injects.length) {
            injects.forEach((i) => {
              if (i.metadata) {
                deps.set(mirror.index, i.metadata);
              }
            });
          }
        });
      }
      deps.forEach((v, k) => {
        args[k] = injector.get(v);
      });
    }
    return Reflect.construct(target, args);
  }

  /**
   * Lookup providers
   * @param providers
   */
  public static lookupProviders(providers: StaticProvider[]): {
    records: Map<ProviderToken<any>, ProviderInfo<any>>;
    staticProviders: Map<StaticProvider, ProviderToken<any>>;
  } {
    const records = new Map<ProviderToken<any>, ProviderInfo<any>>();
    const staticProviders = new Map<StaticProvider, ProviderToken<any>>();
    providers.forEach((provider) => {
      // TypeProvider
      if (typeof provider === 'function') {
        staticProviders.set(provider, provider);
        records.set(provider, {
          type: 'type',
          useClass: provider,
        });
      } else {
        const { provide, useClass, deps, useValue, useFactory } = provider;
        if (provide) {
          // ClassProvider
          if (useClass) {
            staticProviders.set(provider, provide);
            records.set(provide, {
              type: 'type',
              useClass: useClass,
              deps,
            });
          }
          // FactoryProvider
          else if (useFactory) {
            staticProviders.set(provider, provide);
            records.set(provide, {
              type: 'factory',
              useFactory: useFactory as any,
              deps,
            });
          }
          // ValueProvider
          else if (useValue) {
            staticProviders.set(provider, provide);
            records.set(provide, {
              type: 'value',
              useValue,
            });
          } else {
            staticProviders.set(provider, provide);
            // ConstructorProvider
            records.set(provide, {
              type: 'type',
              useClass: provide as Type<any>,
              deps,
            });
          }
        }
      }
    });
    return { records, staticProviders };
  }

  /**
   * Registered providers
   * @internal
   * @protected
   */
  protected records: Map<ProviderToken<any>, ProviderInfo<any>>;

  /**
   * Registered staticProviders
   * @internal
   * @protected
   */
  protected staticProviders: Map<StaticProvider, ProviderToken<any>>;

  /**
   * Registered provider instances
   * @internal
   * @protected
   */
  protected providers = new Map<ProviderToken<any>, any>();

  /**
   * constructor
   * @public
   * @param _providers
   * @param parent
   * @param name
   */
  public constructor(
    private _providers: StaticProvider[],
    protected parent?: Injector,
    protected name?: string
  ) {
    const { records, staticProviders } =
      EnvironmentInjector.lookupProviders(_providers);
    this.records = records;
    this.staticProviders = staticProviders;
  }

  /**
   * @public
   * @param target
   * @param deps
   */
  public construct<T>(
    target: Type<T> | AbstractType<T>,
    deps?: ProviderToken<any>[]
  ): T {
    const has = this.records.has(target);
    if (!has) {
      throw new Error(`Cannot invoke class: "${target.name}"`);
    }
    return EnvironmentInjector.construct(target as Type<any>, this, deps);
  }

  /**
   * @private _construct
   * @internal
   * @param target
   * @param deps
   */
  private _construct<T>(
    target: Type<T> | AbstractType<T>,
    deps?: ProviderToken<any>[]
  ): T {
    return EnvironmentInjector.construct(target as Type<any>, this, deps);
  }

  /**
   * @public
   * @param token
   */
  public initProvide<T>(token: ProviderToken<T>): T | undefined {
    const provideInfo = this.records.get(token) as ProviderInfo<T>;
    if (!provideInfo) {
      return;
    }
    if (provideInfo.type === 'value') {
      return provideInfo.useValue;
    } else if (provideInfo.type === 'type') {
      return this._construct(provideInfo.useClass, provideInfo.deps);
    }
    return provideInfo.useFactory(
      ...(provideInfo.deps || []).map((token) => this.get(token))
    );
  }

  /**
   * Retrieves an instance from the injector based on the provided token.
   * @param token
   * @param notFoundValue
   */
  public get<T>(token: ProviderToken<T>, notFoundValue?: T): T {
    let instance = this.providers.get(token);
    // Find in current
    if (!instance) {
      instance = this.initProvide(token);
    }
    if (!instance) {
      const host = hosts.get(this.parent || this) || new Host();
      hosts.set(this.parent || this, host);
      const { scopes, scopeInjectors } = host;
      instance = scopes.get(token as Type<any>);
      const injector = scopeInjectors.get(token as any) as EnvironmentInjector;
      if (!instance && scopes.has(token as any) && injector) {
        instance = injector._construct(token as any);
        scopes.set(token as any, instance);
      }
    }
    if (!instance) {
      throw new Error(`Cannot find token: "${token.name}".`);
    }
    this.providers.set(token, instance);
    return instance;
  }

  /**
   * Invoke object method
   * @param obj
   * @param propertyKey
   */
  public invoke<O extends {}>(obj: O, propertyKey: keyof O): unknown {
    const fn = obj[propertyKey];
    if (typeof fn !== 'function') {
      throw new Error(
        `The property :"${propertyKey.toString()}" is not a function`
      );
    }
    const mirror = MethodMirror.reflect(
      obj.constructor,
      propertyKey as string,
      false
    );

    const deps: ProviderToken<any>[] = [];

    if (mirror) {
      const parameters = mirror.getParameters();
      const map: Map<number, ProviderToken<any>> = new Map();
      parameters.forEach((value, index) => {
        const decorates = value.getDecorates(InjectDecorate);
        if (decorates.length) {
          decorates.forEach((o) => {
            map.set(value.index, o.metadata);
          });
        } else {
          map.set(value.index, value.getDesignParamType() as any);
        }
      });
      map.forEach((o, i) => {
        deps[i] = o;
      });
    }
    return fn(...deps.map((o) => this.get(o)));
  }
}
