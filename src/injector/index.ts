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
import { ProviderToken, StaticProvider } from '../interfaces';
import { Helpers } from '../helpers';

/**
 * @author RanYunLong<549510622@qq.com>
 * @class BaseInjector
 */
export abstract class Injector {
  /**
   * construct
   * @param target
   * @param argumentsList
   */
  public static construct<T extends {}>(
    target: Function,
    argumentsList: ArrayLike<any>
  ): T {
    return Reflect.construct(target, argumentsList);
  }

  protected provide: Map<ProviderToken<any>, any> = new Map();

  /**
   * constructor
   * @param providers
   */
  protected constructor(protected providers: StaticProvider[]) {}

  /**
   * lookupProviders
   * @param token
   * @private
   */
  private lookupProviders(token: ProviderToken<any> | object): void {
    const find = this.providers.find(({ provide }) => token === provide);
    if (find) {
      const { deps = [], useClass, useValue, useFactory, provide } = find;
      if (deps) {
        if (!Array.isArray(deps)) {
          throw new TypeError(
            `The deps ${Helpers.toString(deps)} is not a array.`
          );
        }
        deps.forEach((dep) => this.lookupProviders(dep));
      }
      // It's a value provider
      if (useValue) {
        this.provide.set(provide, useValue);
      } else if (useClass) {
        const _ = Injector.construct(
          useClass,
          deps.map((dep) => this.provide.get(dep))
        );
        this.provide.set(provide, _);
      } else if (useFactory) {
        if (typeof useFactory !== 'function') {
          throw new TypeError(
            `The factory ${Helpers.toString(useFactory)} is not a function.`
          );
        }
        const _ = useFactory(...deps.map((dep) => this.provide.get(dep)));
        this.provide.set(provide, _);
      }
    }
  }

  /**
   * Retrieves an instance from the injector based on the provided token.
   * @param token
   * @param notFoundValue
   */
  public get<T>(token: ProviderToken<T>, notFoundValue?: T): T | undefined {
    if (!this.provide.has(token)) {
      this.lookupProviders(token);
      return this.provide.get(token);
    }
    return this.provide.get(token) || notFoundValue;
  }
}
