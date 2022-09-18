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

import { InjectionToken } from '../injection-token';

export interface Type<T> {
  new (...args: any[]): T;
}

export type TypeProvider = Type<any>;
export interface ValueProvider {
  provide: Type<any> | InjectionToken;
  useValue: any;
  useClass?: never;
  useFactory?: never;
  deps?: never;
}
export interface ClassProvider {
  provide: Type<any> | InjectionToken;
  useValue?: never;
  useClass: Type<any>;
  useFactory?: never;
  deps?: never;
}

export interface ConstructorProvider {
  provide: Type<any>;
  useValue?: never;
  useClass?: never;
  useFactory?: never;
  deps?: ProviderToken<any>[];
}

export interface FactoryProvider {
  provide: Type<any> | InjectionToken;
  useValue?: never;
  useClass?: never;
  useFactory: Function;
  deps?: ProviderToken<any>[];
}

export interface AbstractType<T> extends Function {
  prototype: T;
}

export type Provider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | ConstructorProvider
  | FactoryProvider;

export type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>;

export type StaticProvider = Provider;

export type ProviderInfo<T> =
  | ValueProviderInfo<T>
  | FactoryProviderInfo<T>
  | TypeProviderInfo<T>;

export interface ValueProviderInfo<T> {
  type: 'value';
  useValue: T;
}

export interface FactoryProviderInfo<T> {
  type: 'factory';
  useFactory: (...args: any[]) => T;
  deps?: ProviderToken<any>[];
}

export interface TypeProviderInfo<T> {
  type: 'type';
  useClass: Type<T>;
  deps?: ProviderToken<any>[];
}

export interface LookupDecorates {
  providers: Set<Provider>;
  exports: Set<Provider>;
  imports: Set<Type<any>>;
  deps: Map<number, ProviderToken<any>>;
}
