import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class CryptoTool {
    constructor() {}

    md5(text: any) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    sha256(data: any): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    sha1(data: any): string {
        return crypto.createHash('sha1').update(data).digest('hex');
    }
}
