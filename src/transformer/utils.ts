import { FieldType } from '../scraper/types';

export const toTypeScriptType = (fieldType: FieldType): string => {
    if (fieldType.type === 'unknown') {
        return 'unknown';
    }
    if (fieldType.type === 'name') {
        return fieldType.value;
    }
    if (fieldType.type === 'primitive') {
        if (fieldType.value === 'boolean') {
            return 'boolean';
        }
        if (fieldType.value === 'true') {
            return 'true';
        }
        if (fieldType.value === 'false') {
            return 'false';
        }
        if (fieldType.value === 'integer' || fieldType.value === 'float') {
            return 'number';
        }
        if (fieldType.value === 'string') {
            return 'string';
        }
        fieldType.value as void; // assert we've covered all the cases
        return 'never';
    }
    if (fieldType.type === 'array') {
        const componentType = toTypeScriptType(fieldType.component);
        return `${componentType}[]`;
    }
    if (fieldType.type === 'or') {
        const orType = fieldType.components
            .map(componentType => toTypeScriptType(componentType))
            .join(' | ');

        return `(${orType})`;
    }
    fieldType as void; // assert we've covered all the cases
    return 'never';
};
