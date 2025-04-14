export interface ITokenService {
  generatePasswordSetupToken(userId: number): Promise<string>
  verifyPasswordSetupToken(token: string): Promise<number | null>
}
