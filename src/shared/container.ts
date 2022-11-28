import "reflect-metadata"

import { container } from "tsyringe"
import { BoardService } from "../services/board.service"
import { UserService } from "../services/user.service"
import { PinService } from "../services/pin.service"
import { CommentService } from "../services/comment.service"

container.register("IUserService", { useClass: UserService })
container.register("IBoardService", { useClass: BoardService })
container.register("IPinService", { useClass: PinService })
container.register("ICommentService", { useClass: CommentService })
