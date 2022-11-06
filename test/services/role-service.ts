import {QDInjectable} from "../../src";
import {UserService} from "./user-service";

@QDInjectable()
export class RoleService {
  public constructor(public userService: UserService) {
  }
}