import "reflect-metadata"

import { container } from "tsyringe"
import { BoardService } from "../services/board.service"
import { UserService } from "../services/user.service"

container.register("IUserService", { useClass: UserService })
container.register("IBoardService", { useClass: BoardService })
