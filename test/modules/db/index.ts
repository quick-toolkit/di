import {QDModule} from "../../../src";
import {StorageService} from "./services/storageService";

@QDModule({
  providers: [StorageService],
  exports: [StorageService]
})
export class Db {
  public constructor(public storageService: StorageService) {}
}