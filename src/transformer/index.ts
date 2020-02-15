import * as Handlebars from 'handlebars';

import { collectTypes } from '../scraper/type-convertor';
import { Result, Method, Schema } from '../scraper/types';

import { getTemplates } from './handlebars';
import { getImportPath, getPathToFile } from './paths';
import { TypeScriptGeneration, SchemaImport } from './types';
import { toTypeScriptType } from './utils';

export const generateTypeScript = (
    { version, schemas }: Result,
    schema: Method | Schema,
    template: Handlebars.TemplateDelegate
): TypeScriptGeneration => {
    /* TODO: read these expansions from the HTML (they're represented as unordered lists) */
    const TYPE_EXPANSIONS: Record<string, string> = {
        CallbackGame: 'string',
    };
    for (const type of [
        'InputMedia',
        'InlineQueryResult',
        'PassportElementError',
    ]) {
        TYPE_EXPANSIONS[type] = schemas
            .map(schema => schema.name)
            .filter(name => name.startsWith(type))
            .join(' | ');
    }
    TYPE_EXPANSIONS['InputMessageContent'] = schemas
        .map(schema => schema.name)
        .filter(name => /Input.*MessageContent/.test(name))
        .join(' | ');

    const schemaFilePath = getPathToFile(schema);

    const imports = schema.fields
        .flatMap(field => collectTypes(field.type))
        .filter(fieldType => fieldType.type === 'name')
        .map(fieldType => toTypeScriptType(fieldType))
        .flatMap(typeScriptType =>
            typeScriptType
                .replace(/(\w+)/g, match =>
                    match in TYPE_EXPANSIONS ? TYPE_EXPANSIONS[match] : match
                )
                .replace(/\[\]/g, '')
                .split(' | ')
        )
        .sort()
        .reduce<SchemaImport[]>((acc, type) => {
            console.log(schema.name, type);
            if (acc.find(s => s.name === type)) {
                return acc;
            }

            /* TODO: handle InputFile properly / create a dummy type for it */
            if (type === 'InputFile' || type === 'string') {
                return acc;
            }

            const referencedSchema = schemas.find(s => s.name === type);
            if (!referencedSchema) {
                throw new Error(
                    `Found referenced schema '${type}' in ${schema.type} '${schema.name}' but it wasn't found in the list of known schemas.`
                );
            }

            const importPath = getImportPath(schema, referencedSchema);
            if (typeof importPath === 'string') {
                acc.push({ name: type, path: importPath });
            }
            return acc;
        }, []);

    return {
        outputPath: schemaFilePath,
        output: template({ version, schema, imports }),
    };
};

export const transform = (result: Result): TypeScriptGeneration[] => {
    const templates = getTemplates();
    return [
        ...result.methods.map(method =>
            generateTypeScript(result, method, templates.method)
        ),
        ...result.schemas.map(schema =>
            generateTypeScript(result, schema, templates.schema)
        ),
    ];
};
