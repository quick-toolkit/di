import {QDModule} from "../src";
import {UserService} from "./services/user-service";
import {Db} from "./modules/db";
import {User} from "./modules/user";
import {StorageService} from "./modules/db/services/storageService";
import {RoleService} from "./services/role-service";

@QDModule({
  imports: [Db, User],
  providers: [UserService, RoleService]
})
export class Application {
  public constructor(public userService: UserService, public db: Db, public user: User, public storage: StorageService, public roleService: RoleService) {}
}