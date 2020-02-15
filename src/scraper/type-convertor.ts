import { FieldType, SimpleType } from './types';

const parseSimpleType = (type: string): FieldType | void => {
    switch (type.toLowerCase()) {
        case 'string':
            return { type: 'primitive', value: 'string' };
        case 'integer':
            return { type: 'primitive', value: 'integer' };
        case 'float':
        case 'float number':
            return { type: 'primitive', value: 'float' };
        case 'boolean':
            return { type: 'primitive', value: 'boolean' };
        case 'true':
            return { type: 'primitive', value: 'true' };
        case 'false':
            return { type: 'primitive', value: 'false' };
    }

    if (/^\w+$/.test(type)) {
        return {
            type: 'name',
            value: type,
        };
    }

    return undefined;
};

export const parseType = (type: string): FieldType => {
    try {
        const simpleType = parseSimpleType(type);
        if (simpleType) {
            return simpleType;
        }

        if (type.startsWith('Array of ')) {
            return {
                type: 'array',
                component: parseType(type.substring('Array of '.length)),
            };
        }

        const andOrMatch = /(.+) (?:or|and) (.+)/.exec(type);
        if (andOrMatch) {
            const [, first, second] = andOrMatch;
            const firstType = parseType(first);
            const secondType = parseType(second);

            const components = [
                ...(firstType.type === 'or'
                    ? firstType.components
                    : [firstType]),
                ...(secondType.type === 'or'
                    ? secondType.components
                    : [secondType]),
            ];

            return { type: 'or', components };
        }
    } catch (error) {
        console.error(`An error occurred while parsing the type: ${type}`);
        return { type: 'unknown' };
    }

    throw new Error(`Unable to parse type: ${type}`);
};

export const collectTypes = (type: FieldType): SimpleType[] => {
    const remaining: FieldType[] = [type];
    const collected: SimpleType[] = [];
    while (remaining.length > 0) {
        const top = remaining.shift();
        if (!top) break;
        switch (top.type) {
            case 'primitive':
            case 'name':
                collected.push(top);
                break;
            case 'array':
                remaining.push(top.component);
                break;
            case 'or':
                remaining.push(...top.components);
                break;
        }
    }
    return collected;
};
