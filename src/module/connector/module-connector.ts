import { Optional, ClassError, RuntimeError } from '@heronjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { ClassConstructor } from 'class-transformer';

export enum ModuleConnectionTypes {
    INJECTION = 'INJECTION',
    RESTFUL = 'RESTFUL',
}

export type ModuleConnectorServiceMethodConfig = {
    authToken?: string;
    requestConfig?: AxiosRequestConfig;
};

const HEADER_KEY_INTERNAL_API_KEY = 'internal-api-key';

export class RestfulService {
    constructor(payload: { host: Optional<string>; secretKey: Optional<string>; moduleName: string }) {
        const { host, secretKey, moduleName } = payload;

        if (!host)
            throw new Error(
                `Restful connector host is not defined, please define environment variable ${moduleName}_MODULE_HOST.`,
            );

        if (!secretKey)
            throw new Error(
                `Restful connector secretKey is not defined, please define environment variable SECRET_KEY_INTERNAL_API_${moduleName}.`,
            );

        this._host = host;
        this._secretKey = secretKey;
    }

    private readonly _host: string;
    private readonly _secretKey: string;

    protected get host(): string {
        return this._host;
    }

    protected get secretKey(): string {
        return this._secretKey;
    }

    protected buildUrl(payload: { pathname: string; id?: string | number; query?: string }): string {
        const { pathname, id, query } = payload;
        return `${this.host}${pathname}${id ? '/' + id : ''}${query ? '?' + query : ''}`;
    }

    protected buildConfig(payload?: ModuleConnectorServiceMethodConfig): AxiosRequestConfig {
        return {
            ...payload?.requestConfig,
            headers: {
                ...(payload?.requestConfig?.headers ?? {}),
                authorization: payload?.authToken ?? payload?.requestConfig?.headers?.authorization ?? '',
                [HEADER_KEY_INTERNAL_API_KEY]: this.secretKey
                    ? this.secretKey
                    : payload?.requestConfig?.headers
                    ? payload?.requestConfig.headers['internal-api-key'] ?? ''
                    : '',
            },
        };
    }

    protected async callAPI<T>(exec: () => Promise<T>): Promise<T> {
        try {
            return await exec();
        } catch (error) {
            const axiosError = error as AxiosError;

            const data: { error: any; message: string; details?: ClassError[] } = axiosError.response
                ?.data as any;

            if (data) {
                const arr = data?.error?.split(':');

                if (arr?.length !== 2) {
                    throw error;
                } else {
                    const [namespace, code] = arr;
                    throw new RuntimeError(namespace, code, data.message, axiosError);
                }
            }

            throw error;
        }
    }
}

export interface IModuleConnector<T> {
    service: T;
}

export class ModuleConnector<T> implements IModuleConnector<T> {
    constructor(payload: {
        classInjectionService?: ClassConstructor<T>;
        classRestfulService?: ClassConstructor<T>;
        moduleName: string;
        type?: string;
    }) {
        const { classInjectionService, classRestfulService, moduleName, type } = payload;

        if (classInjectionService) {
            this._service = new classInjectionService();
        } else {
            if (!type)
                throw new Error(
                    `Module connection type is not defined, please define environment variable ${moduleName}_MODULE_CONNECTION_TYPE.`,
                );

            switch (type) {
                case ModuleConnectionTypes.RESTFUL:
                    if (classRestfulService) {
                        this._service = new classRestfulService();
                        break;
                    }
                    throw new Error(`Module connection type ${type} is not implement.`);

                default:
                    throw new Error(`Module connection type ${type} is not support.`);
            }
        }
    }

    private readonly _service: T;
    public get service(): T {
        return this._service;
    }
}
