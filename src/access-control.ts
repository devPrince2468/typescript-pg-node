import { AccessControl } from "accesscontrol";

export enum AppRoles {
  ADMIN = "ADMIN",
  USER = "USER",
}

const ac = new AccessControl();

ac.grant(AppRoles.USER)
  .readAny("product")
  .readAny("category")
  .createOwn("order")
  .readOwn("order")
  .updateOwn("order")
  .deleteOwn("order");

ac.grant(AppRoles.ADMIN)
  .readAny("product")
  .createAny("product")
  .updateAny("product")
  .deleteAny("product")
  .readAny("category")
  .createAny("category")
  .updateAny("category")
  .deleteAny("category")
  .readAny("order")
  .readAny("user");

export default ac;
