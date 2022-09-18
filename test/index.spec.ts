import 'reflect-metadata';
import {describe} from 'mocha';
import {assert} from 'chai'
import { Application } from '../sample/create-application';
import {Injector} from "../src";

describe('index.spec.ts', () => {
  it('init app', async () => {
    const app = Injector.bootstrap(Application);
    assert.instanceOf(app, Application);
  });
});
