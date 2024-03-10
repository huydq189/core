import { Optional } from '@heronjs/common';
import { EavAttributeValueDto } from '../eav';

type DtoTransformOptions = {
    handler?: (input: object) => unknown;
    datetimeFormat?: 'iso8601' | 'unix';
    attributeFormat?: 'object' | 'array';
};

export class DtoUtil {
    private static convertToUnixtime(data: object) {
        Object.keys(data).forEach((key) => {
            const index = key as keyof typeof data;
            const value: any = data[index];

            if (value) {
                if (typeof value === 'object') {
                    if (value instanceof Date) {
                        // @ts-ignore
                        data[index] = value.getTime();
                    } else {
                        this.convertToUnixtime(value);
                    }
                }
            }
        });
    }

    static transform<T>(
        input: T,
        options: DtoTransformOptions = { datetimeFormat: 'iso8601', attributeFormat: 'object' },
    ): T {
        if (input === undefined || input === null) return input;

        let data: any = input;

        if (options?.handler) data = options.handler(data);
        if (options?.datetimeFormat === 'unix') this.convertToUnixtime(data);
        if (data.attributes && options?.attributeFormat === 'object') {
            if (data.attributes) {
                const attributesMap: Record<string, any> = {};
                for (const attr of data.attributes) {
                    attributesMap[attr.attributeCode] = attr.value;
                }
                data.attributes = attributesMap;
            }
        }

        return data as T;
    }

    static transformList<T>(
        input: T[],
        options: DtoTransformOptions = { datetimeFormat: 'iso8601', attributeFormat: 'object' },
    ) {
        if (!input.length) return input;

        return input.map((item) => DtoUtil.transform(item, options));
    }

    static mapAttributes(input: Optional<EavAttributeValueDto[]>) {
        if (input) {
            const attributesMap: Record<string, any> = {};
            for (const attr of input) {
                attributesMap[attr.attributeCode] = attr.value;
            }
            return attributesMap;
        }
    }
}
