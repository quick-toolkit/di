import {QDModule} from "../../../src";
import {Storage} from "./services/storage";

@QDModule({
  providers: [Storage]
})
export class Db {
  public constructor(public storage: Storage) {}
}