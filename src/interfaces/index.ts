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

export type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>;

export type MergeAlias<T extends {}> = { alias: object } & T;

export type Provider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | ConstructorProvider
  | FactoryProvider;

export type StaticProvider =
  | ValueProvider
  | ClassProvider
  | ConstructorProvider
  | FactoryProvider;
