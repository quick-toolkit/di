import {QDModule} from "../../src";
import {ConfigService} from "./config.service";

@QDModule({
  // provider services
  providers: [ConfigService],
  exports: [ConfigService],
})
export class Config {
  constructor(private service: ConfigService) {
    service.getName() // alice
    service.setName('bob');
  }
}