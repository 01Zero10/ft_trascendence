import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorAuth } from './twoFactorAuth.service';

@Module({
  imports: [UsersModule,
  JwtModule.register({
    secret: "Segreto243",
    signOptions: {expiresIn: "1d",}
  })
],
  controllers: [AuthController],
  providers: [AuthService, TwoFactorAuth],
  exports: [TwoFactorAuth]
})
export class AuthModule {}
