import {QDInjectable} from "../../src";

@QDInjectable()
export class ConfigService {
  private name: string = "alice"
  public setName(name: string) {
    this.name = name;
  }
  public getName(): string {
    return this.name;
  }
}