import { Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import { UserService } from "src/user/user.service";
import { toFileStream } from 'qrcode';
import { User } from "src/user/user.entity";
import { Response } from "express";

@Injectable()
export class TwoFactorAuth {
    constructor(private readonly userService: UserService) {}

    public async generate2FASecret(id: number) {
        const secret = authenticator.generateSecret();
        const otpathUrl = authenticator.keyuri(
            'Transcendenza ad alta frequenza',
            'Google Authenticator', //process.env.TWO_FA_AUTH_APP_NAME
            secret,
        );
        await this.userService.set2FASecret(secret, id);
        return {
            secret,
            otpathUrl,
        };
    }

    public async pipeQrCodeStream(stream: Response, otpathUrl: string) {
        return toFileStream(stream, otpathUrl);
    }

    public check2FACode(code2FA: string, secret: string) {
        return authenticator.verify({
            token: code2FA, //in questo caso va passata la OTP non il Token
            secret: secret,
        });
    }
}