import 'reflect-metadata';
import {describe} from 'mocha';
import {assert} from 'chai';
import {EnvironmentInjector} from "../src";
import {Application} from "./application";

describe('index.spec.ts', () => {
  it('should import module one instance.',  () => {
    const app = EnvironmentInjector.run(Application);
    app.user.db.storageService.updateName()
    assert.equal(app.db, app.user.db);
    assert.equal(app.user.db.storageService, app.db.storageService)
    assert.equal(app.user.db.storageService.getName(), app.db.storageService.getName())
    assert.equal(app.userService, app.roleService.userService)
  });
});
