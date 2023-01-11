import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res, UnauthorizedException, UseGuards, ClassSerializerInterceptor, UseInterceptors} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { UserService } from "src/user/user.service";
import { AuthGuard } from "./auth.guard";
import { TwoFactorAuth } from "./twoFactorAuth.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {
  constructor(
    private readonly user: UserService,
    private readonly twoFaAuthService: TwoFactorAuth,
    private readonly jwt: JwtService,
    ) {}

  @UseGuards(AuthGuard)
  @Post('generate')
  @UseInterceptors(ClassSerializerInterceptor)
  async check(@Body('id') id: number, @Res() response: Response){
    const { otpathUrl } = await this.twoFaAuthService.generate2FASecret(id);
    return this.twoFaAuthService.pipeQrCodeStream(response, otpathUrl);
  }
  
  //@UseGuards(AuthGuard)
  @Post('enable2fa')
  @HttpCode(200)
  async turnOn2FA(@Body('pin') code: string, @Body('id') id: string): Promise<any>{
    const user42 = (await this.user.getById(Number(id))).twoFaAuthSecret;
    const isCodeValid = this.twoFaAuthService.check2FACode(code, user42);
    if (isCodeValid)
      await this.user.turnOn2FA(Number(id));
    return ({res: (await (this.user.getById(Number(id)))).two_fa_auth});
  }

    //@UseGuards(AuthGuard)
    @Post('isFAValid')
    @HttpCode(200)
    async isFAValid(@Body('pin') code: string, @Body('id') id: string): Promise<any>{
      const user42 = (await this.user.getById(Number(id))).twoFaAuthSecret;
      const isCodeValid = this.twoFaAuthService.check2FACode(code, user42);
      return ({'ret': isCodeValid});
    }
  

  @Post('auth2fa') //??? la usiamo?
  @HttpCode(200)
  async auth2fa(@Req() request: Request, @Body() data: { twoFaAuthCode: string }) {
    const cookie = request.cookies['token'];

    const user = await this.user.userCookie(cookie);
    const isCodeValid = this.twoFaAuthService.check2FACode(
      data.twoFaAuthCode,
      user,
    );
    if (!isCodeValid) {
      return false;
    }

    request.res.clearCookie('token');
    const token = await this.jwt.signAsync({ id: user.id, two_fa: false });
    request.res.cookie('token', token, { httpOnly: true });
    return true;
  }

  @Get("login")
  async login(
    @Query("code") code: string,
    @Query("state") path: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<any> {
    const { user, first } = await this.user.login(code, response);
    if (first)
      return response.redirect(`http://${process.env.IP_ADDR}:3000/users/settings`);
    else 
      return response.redirect(`http://${process.env.IP_ADDR}:3000/home`);
  }

  @Get("logout") //Vanno aggiunte altre cose???
  async logout(@Req() request: Request) {
    request.res.clearCookie('token');
  }

  @Get('user')
  async userCookie(@Req() request: Request) {
    const cookie = request.cookies['token'];
    if (typeof cookie === 'undefined')
      return {id: null};
    const data = await this.jwt.verifyAsync(cookie);
    const user = await this.user.userCookie(cookie);
    return {...user, two_fa: data['two_fa']};
  }
}
