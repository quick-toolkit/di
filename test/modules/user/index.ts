import {QDModule} from "../../../src";
import {Db} from "../db";

@QDModule({
  imports: [Db]
})
export class User {
  public constructor(public db: Db) {

  }
}