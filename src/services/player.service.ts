import { PlayerRepositoryInterface } from '@/repositories/player.repository';
import { CreatePlayerInput, UpdatePlayerInput } from '@/schemas/player.schema';
import { AppError } from '@/utils/error-handler';

export class PlayerService {
  constructor(private playerRepo: PlayerRepositoryInterface) {}

  async getAllPlayers(filters?: { gameId?: string; teamId?: string; query?: string }) {
    return this.playerRepo.findAll(filters);
  }

  async getPlayerById(id: string) {
    const player = await this.playerRepo.findById(id);
    if (!player) {
      throw new AppError('Player not found', 404, 'PLAYER_NOT_FOUND');
    }
    return player;
  }

  async createPlayer(data: CreatePlayerInput) {
    return this.playerRepo.create(data);
  }

  async updatePlayer(data: UpdatePlayerInput) {
    const playerId = data.id;
    const existing = await this.playerRepo.findById(playerId);
    if (!existing) {
      throw new AppError('Player not found to update', 404, 'PLAYER_NOT_FOUND');
    }
    return this.playerRepo.update(playerId, data);
  }

  async deletePlayer(id: string) {
    const playerId = id;
    const existing = await this.playerRepo.findById(playerId);
    if (!existing) {
      throw new AppError('Player not found to delete', 404, 'PLAYER_NOT_FOUND');
    }
    return this.playerRepo.softDelete(playerId);
  }
}
