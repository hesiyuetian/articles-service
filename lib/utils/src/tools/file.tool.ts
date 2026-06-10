import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';

@Injectable()
export class FileTool {
    constructor() {}

    fileExists(file: string) {
        const filePath = path.join(__dirname, '../../../../' + file);
        return fs.existsSync(filePath);
    }

    mkdir(dir: string) {
        const filePath = path.join(__dirname, '../../../../' + dir);
        console.log('mkdir:', filePath);
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        return filePath;
    }

    pathConcat(...paths: any) {
        paths = paths.filter((d: any) => {
            if (d) return d;
        });
        for (let i = 0; i < paths.length; i++) {
            if (i === 0) {
                if (paths[i].substr(-1, 1) === '/') paths[i] = paths[i].substring(0, paths[i].length - 1);
            } else {
                if (paths[i].substr(0, 1) === '/') paths[i] = paths[i].substring(1);
            }
        }
        const res = paths.join('/');
        return res;
    }
}
