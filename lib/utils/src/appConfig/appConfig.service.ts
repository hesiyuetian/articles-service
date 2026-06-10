import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService extends ConfigService {
    /**
     * Get configuration value, supports default value
     * @param key Configuration key name
     * @param defaultValue Optional default value
     * @throws Error When configuration value is not found and no default value is provided
     */
    getConfigValue<T = string>(key: string, defaultValue?: T): T {
        const value = this.get<T>(key);

        if (value !== undefined && value !== null) {
            return value;
        }

        if (defaultValue !== undefined) {
            return defaultValue;
        }

        throw new Error(`Configuration ${key} is required`);
    }

    /**
     * Safely get configuration value, will not throw exception
     * @param key Configuration key name
     * @param defaultValue Default value
     */
    safeGetConfigValue<T = string>(key: string, defaultValue: T): T {
        try {
            return this.getConfigValue<T>(key, defaultValue);
        } catch {
            return defaultValue;
        }
    }

    /**
     * 获取必需的配置值
     * @param key 配置键名
     * @throws Error 当配置值不存在时
     */
    getRequiredConfig<T = string>(key: string): T {
        return this.getConfigValue<T>(key);
    }
}
