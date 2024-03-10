import { Optional } from '@heronjs/common';
import { FilterInput, SortInput } from '../database';
import { HookMap, HookTypes } from './hook';

// UseCaseMethodInput
export type ResultOf<T, M extends keyof T> = Awaited<
    ReturnType<T[M] extends (...args: any) => any ? T[M] : never>
>;

type UseCasePipeMethod = (input: ResultOf<any, any>) => any;

// Types
export type AuthInput = {
    isAdmin?: boolean;
    authId?: string;
    token?: string;
    metadata?: any;
};

export type PaginationInput<T = any> = {
    offset?: number;
    limit?: number;
    sort?: SortInput<T>;
    filter?: FilterInput<T>;
    eavFilter?: FilterInput;
};

// Context
export type UseCaseContext = {
    auth?: AuthInput;
};

// UseCase
export interface IUseCase<I = any, O = any, C = any> {
    exec(input: I, initialContext?: C): Promise<O>;
    commit(output: O): void;
}

export class UseCase<I, O, C> implements IUseCase<I, O, C> {
    private _input!: I;
    protected get input(): I {
        return this._input;
    }

    private _output!: O;
    protected get output(): O {
        return this._output;
    }

    protected context!: C;

    private _isCommitted: boolean = false;
    private get isCommitted(): boolean {
        return this._isCommitted;
    }

    private _methods: Optional<UseCasePipeMethod>[] = [];
    protected get methods(): Optional<UseCasePipeMethod>[] {
        return this._methods;
    }

    protected get hookMap(): HookMap<typeof this> {
        return (this.constructor as any).hookMap;
    }

    protected setMethods<O>(...methods: [fn: (input: I) => Promise<O>]): any;
    protected setMethods<O1>(
        ...methods: [fn1: (input: I) => O1, fn2: (input: Awaited<O1>) => Promise<O>]
    ): any;
    protected setMethods<O1, O2>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3, O4>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => O4,
            fn5: (input: Awaited<O4>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3, O4, O5>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => O4,
            fn5: (input: Awaited<O4>) => O5,
            fn6: (input: Awaited<O5>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3, O4, O5, O6>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => O4,
            fn5: (input: Awaited<O4>) => O5,
            fn6: (input: Awaited<O5>) => O6,
            fn7: (input: Awaited<O6>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3, O4, O5, O6, O7>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => O4,
            fn5: (input: Awaited<O4>) => O5,
            fn6: (input: Awaited<O5>) => O6,
            fn7: (input: Awaited<O6>) => O7,
            fn8: (input: Awaited<O7>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3, O4, O5, O6, O7, O8>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => O4,
            fn5: (input: Awaited<O4>) => O5,
            fn6: (input: Awaited<O5>) => O6,
            fn7: (input: Awaited<O6>) => O7,
            fn8: (input: Awaited<O7>) => O8,
            fn9: (input: Awaited<O8>) => Promise<O>,
        ]
    ): void;
    protected setMethods<O1, O2, O3, O4, O5, O6, O7, O8, O9>(
        ...methods: [
            fn1: (input: I) => O1,
            fn2: (input: Awaited<O1>) => O2,
            fn3: (input: Awaited<O2>) => O3,
            fn4: (input: Awaited<O3>) => O4,
            fn5: (input: Awaited<O4>) => O5,
            fn6: (input: Awaited<O5>) => O6,
            fn7: (input: Awaited<O6>) => O7,
            fn8: (input: Awaited<O7>) => O8,
            fn9: (input: Awaited<O8>) => O9,
            fn10?: (input: Awaited<O9>) => Promise<O>,
        ]
    ): void;
    protected setMethods(...methods: any[]): any {
        this._methods = methods;
    }

    public commit(output: O): void {
        this._output = output;
        this._isCommitted = true;
    }

    private async complete(): Promise<O> {
        if (this.onSuccess) await this.onSuccess(this.output);
        return this.output;
    }

    async exec(input: I, initialContext?: C): Promise<O> {
        if (!this._methods || this._methods.length === 0)
            throw new Error('Pipe methods not setted or empty!');

        // Reset all state
        this._input = input;
        this._output = undefined as O;
        this.context = (initialContext ?? {}) as C;
        this._isCommitted = false;

        // Execute all methods
        let outputOfMethod = input;
        try {
            for (let i = 0; i < this._methods.length; i++) {
                const method = this._methods[i];

                if (typeof method !== 'function') throw new Error('Pipe method is not valid function!');

                const stepName = method.name;
                const hookOfStep = this.hookMap?.get(stepName as any);

                // Excute before hooks
                if (hookOfStep && hookOfStep[HookTypes.Before]) {
                    const beforeHooks = hookOfStep[HookTypes.Before];
                    for (let i = 0; i < beforeHooks.length; i++) {
                        const hook = beforeHooks[i];
                        if (typeof hook !== 'function') throw new Error('Hook is not valid function!');
                        outputOfMethod = await hook(outputOfMethod as any, this);
                        if (this.isCommitted) return this.complete();
                    }
                }

                // Excute step
                const methodBinded = method.bind(this);
                outputOfMethod = await methodBinded(outputOfMethod);
                if (this.isCommitted) return this.complete();

                // Excute after hooks
                if (hookOfStep && hookOfStep[HookTypes.After]) {
                    const afterHooks = hookOfStep[HookTypes.After];
                    for (let i = 0; i < afterHooks.length; i++) {
                        const hook = afterHooks[i];
                        if (typeof hook !== 'function') throw new Error('Hook is not valid function!');
                        outputOfMethod = await hook(outputOfMethod as any, this);
                        if (this.isCommitted) return this.complete();
                    }
                }
            }

            this.commit(outputOfMethod as unknown as O);
            return this.complete();
        } catch (error) {
            if (this.onFailure) await this.onFailure(error);
            throw error;
        }
    }

    protected onSuccess?: (output: O) => void;
    protected onFailure?: (error: unknown) => void;
}
