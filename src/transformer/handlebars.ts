import { readFileSync } from 'fs';

import * as Handlebars from 'handlebars';

import { FieldType } from '../scraper/types';

import { toTypeScriptType } from './utils';

export const getTemplates = (): {
    schema: Handlebars.TemplateDelegate;
    method: Handlebars.TemplateDelegate;
} => {
    /*
     * Handlebars stuff
     */

    Handlebars.registerHelper(
        'capitalize',
        (value: string) => value.charAt(0).toUpperCase() + value.substring(1)
    );
    Handlebars.registerHelper(
        'comment_lines',
        (indent: number, value: string) => {
            const padding = ''.padStart(indent, ' ');

            return value
                .split('\n')
                .map((line, i) => `${i ? padding : ''}* ${line.trim()}`)
                .join('\n');
        }
    );
    Handlebars.registerHelper('render_type', (type: FieldType) =>
        toTypeScriptType(type)
    );

    return {
        schema: Handlebars.compile(
            readFileSync('templates/schema.hbs').toString()
        ),
        method: Handlebars.compile(
            readFileSync('templates/method.hbs').toString()
        ),
    };
};
