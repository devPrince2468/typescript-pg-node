import { AccessControl } from "accesscontrol";

export enum AppRoles {
  ADMIN = "ADMIN",
  USER = "USER",
}

const ac = new AccessControl();

ac.grant(AppRoles.USER)
  .readOwn("product")
  .readAny("category")
  .createOwn("order")
  .readOwn("order");

ac.grant(AppRoles.ADMIN)
  .extend(AppRoles.USER)
  .createAny("product")
  .updateAny("product")
  .deleteAny("product")
  .createAny("category")
  .updateAny("category")
  .deleteAny("category")
  .readAny("order")
  .updateAny("order")
  .deleteAny("order");

export default ac;
