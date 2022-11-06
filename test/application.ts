import {QDModule} from "../src";
import {UserService} from "./services/user-service";
import {Db} from "./modules/db";
import {User} from "./modules/user";

@QDModule({
  imports: [Db, User],
  providers: [UserService]
})
export class Application {
  public constructor(public userService: UserService, public db: Db, public user: User) {}
}