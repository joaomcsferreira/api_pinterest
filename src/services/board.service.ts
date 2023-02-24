import { ObjectId } from "mongoose"
import { Board } from "../models/board.model"
import { User } from "../models/user.model"
import { BoardRepository } from "../repositories/board.repository"

export class BoardService {
  async createBoard(name: string, user: User): Promise<Board> {
    const result = await BoardRepository.create({
      name: name.toLocaleLowerCase(),
      user,
    })

    return result
  }

  async getBoards(id: ObjectId): Promise<Array<Board>> {
    const result = await BoardRepository.find({ user: id })

    return result
  }

  async deleteBoard(name: string, id: ObjectId): Promise<string> {
    await BoardRepository.deleteOne({ name, user: id })

    return `The board ${name} has been deleted.`
  }

  async getBoard(name: string, userId: ObjectId): Promise<Board | null> {
    const result = await BoardRepository.findOne({ name, user: userId })

    return result
  }

  boardDisplay(board: Board) {
    const boardDisplay = {
      _id: board._id,
      name: board.name,
      user: board.user,
      createdAt: board.createdAt,
    }

    return boardDisplay
  }
}
