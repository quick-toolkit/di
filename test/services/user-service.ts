import {QDInjectable} from "../../src";

@QDInjectable()
export class UserService {
  public getName() {
    return '小明';
  }

  public getAge() {
    return 20;
  }
}