import { Module } from '@nestjs/common';
import { CryptoTool } from './crypto.tool';
import { FileTool } from './file.tool';
import { ImagesTool } from './images.tool';

@Module({
    providers: [CryptoTool, FileTool, ImagesTool],
    exports: [CryptoTool, FileTool, ImagesTool],
})
export class ToolsModule {}
