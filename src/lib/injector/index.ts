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

import {
  AbstractType,
  ProviderToken,
  StaticProvider,
  Type,
} from '../interfaces/provider';
import { EnvironmentInjector } from './environment-injector';
import { DefModuleOptions } from '../decorators/def-module/decorate';

/**
 * @class Injector
 */
export abstract class Injector {
  public static THROW_IF_NOT_FOUND = new Error('THROW_IF_NOT_FOUND');

  /**
   * Creates a new injector instance that provides one or more dependencies, according to a given type or types of StaticProvider.
   * @param providers
   * @param parent
   */
  public static create(
    providers: StaticProvider[],
    parent?: Injector
  ): Injector;
  /**
   * Creates a new injector instance that provides one or more dependencies, according to a given type or types of StaticProvider.
   * @param options
   */
  public static create(options: InjectorOptions): Injector;
  /**
   * Creates a new injector instance that provides one or more dependencies, according to a given type or types of StaticProvider.
   * @param options
   * @param parent
   */
  public static create(
    options: StaticProvider[] | InjectorOptions,
    parent?: Injector
  ): Injector {
    if (Array.isArray(options)) {
      return new EnvironmentInjector(options, parent);
    }
    return new EnvironmentInjector(
      options.providers,
      options.parent,
      options.name
    );
  }

  /**
   * CreateInjector by constructor
   * @param target
   */
  public static createInjector<T>(target: Type<T>): Injector {
    return EnvironmentInjector.createInjector(target, Injector.create([]));
  }

  /**
   * Bootstrap application
   * @param target
   */
  public static bootstrap<T>(target: Type<T> | AbstractType<T>): T {
    return EnvironmentInjector.createInjector(target, Injector.create([])).get(
      target
    );
  }

  /**
   * Construct target
   * @param target
   */
  public abstract construct<T>(target: Type<T>): T;

  /**
   * Invoke object method
   * @param obj
   * @param propertyKey
   */
  public abstract invoke<O extends {}>(
    obj: O,
    propertyKey: symbol | keyof O
  ): unknown;

  /**
   * Retrieves an instance from the injector based on the provided token.
   * @param token
   * @param notFoundValue
   */
  public abstract get<T>(token: ProviderToken<T>, notFoundValue?: T): T;
}

export type BootStrapOptions = DefModuleOptions;

export interface InjectorOptions {
  providers: StaticProvider[];
  parent?: Injector;
  name?: string;
}
