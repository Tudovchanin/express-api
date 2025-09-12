

import type { RefreshTokenRepository } from '../types';

class RefreshTokenService {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async getToken(userId: number) {
    return this.refreshTokenRepository.findByUserId(userId);
  }

  async saveToken(userId: number, token: string, expiresAt: Date) {
    return this.refreshTokenRepository.saveToken(userId, token, expiresAt);
  }

  async deleteToken(userId: number) {
    return this.refreshTokenRepository.deleteToken(userId);
  }

  async revokeToken(userId: number) {
    return this.refreshTokenRepository.revokeByUserId(userId);
  }

  async restoreToken(userId: number) {
    return this.refreshTokenRepository.restoreByUserId(userId);
  }
}


export default RefreshTokenService;