import 'reflect-metadata';
import {describe} from 'mocha';
import {EnvironmentInjector} from "../src";
import {Application} from "./application";

describe('index.spec.ts', () => {
  it('init app', async () => {
    const app = EnvironmentInjector.run(Application);
    app.user.db.storage.updateName()
    console.log(app.db.storage.getName())
    console.log(app.user.db.storage.getName())

    console.log(app.db.storage === app.user.db.storage)
  });
});
