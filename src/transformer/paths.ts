import { Method, Schema } from '../scraper/types';

export const getPathToFile = (schema: Method | Schema): string =>
    `types/${schema.category}/${schema.type}/${schema.name}.ts`;

export const getImportPath = (
    fromSchema: Method | Schema,
    toSchema: Schema
): string | void => {
    if (
        fromSchema.type === toSchema.type &&
        fromSchema.category === toSchema.category &&
        fromSchema.name === toSchema.name
    ) {
        return undefined;
    }

    const pathParts = [];
    if (fromSchema.category !== toSchema.category) {
        pathParts.unshift('..');
        pathParts.push(toSchema.category);
    }
    if (fromSchema.type !== toSchema.type) {
        pathParts.unshift('..');
        pathParts.push(toSchema.type);
    }
    pathParts.push(toSchema.name);

    const path = pathParts.join('/');
    return path.startsWith('../') ? path : `./${path}`;
};
