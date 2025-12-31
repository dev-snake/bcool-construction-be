import { JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';

export class TestUtils {
  static async getAdminToken(app: INestApplication): Promise<string> {
    const jwtService = app.get(JwtService);
    // Mock a payload for an admin user
    // In a real scenario, you might want to create a user in the database
    // but for e2e tests of the API logic, a signed token often suffices
    // if the guard only checks the token.
    // However, if the guard fetches the user from DB, we need a real user.
    
    // Let's assume for now we sign a payload that matches what our JwtStrategy expects.
    const payload = { sub: 'admin-id', email: 'admin@example.com' };
    return jwtService.sign(payload);
  }
}
