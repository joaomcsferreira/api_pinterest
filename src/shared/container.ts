import "reflect-metadata"

import { container } from "tsyringe"
import { UserService } from "../services/user.service"

container.register("IUserService", { useClass: UserService })
