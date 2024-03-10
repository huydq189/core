import { IUseCase, ResultOf } from '../usecase';

export enum HookTypes {
    Before = 'before',
    After = 'aftter',
    Around = 'around',
}

export type HookMethod<T extends IUseCase<any, any, any>> = (
    input: ResultOf<T, keyof T>,
    self: T,
) => Promise<ResultOf<T, keyof T>>;

export type HookMapValue<T extends IUseCase<any, any, any>> = {
    [HookTypes.Before]?: HookMethod<T>[];
    [HookTypes.After]?: HookMethod<T>[];
    [HookTypes.Around]?: HookMethod<T>[];
};

export type HookMap<T extends IUseCase<any, any, any>> = Map<keyof T, HookMapValue<T>>;

export class UsecaseHook<T extends IUseCase<any, any, any>> {
    private readonly hookMap = new Map<keyof T, HookMapValue<T>>();

    constructor(private readonly usecase: T) {
        (this.usecase.constructor as any).hookMap = this.hookMap;
    }

    add = (stepName: keyof T, type: HookTypes, method: HookMethod<T>) => {
        const hookOfStep = this.hookMap.get(stepName);

        if (hookOfStep) {
            if (hookOfStep[type]) hookOfStep[type]!.push(method);
            else hookOfStep[type] = [method];
        } else this.hookMap.set(stepName, { [type]: [method] });
    };
}
