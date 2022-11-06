import {QDInjectable} from "../../../../src";

@QDInjectable()
export class Storage {
  private name: number = new Date().getTime()

  public getName() {
    return this.name;
  }

  public updateName() {
    this.name = new Date().getTime();
  }
}