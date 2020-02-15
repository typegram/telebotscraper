import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

import { DOCS_URL, CATEGORIES } from './constants';
import { parseType } from './type-convertor';
import { Method, Result, Schema } from './types';
import {
    getChildText,
    getHeading,
    getTableRows,
    getText,
    isUpperCase,
    sortBy,
} from './utils';

export const scrape = async (): Promise<Result> => {
    const content = await (await fetch(DOCS_URL)).text();
    const $ = cheerio.load(content);

    // The current version is the first p that's a direct sibling to an h4
    const version = getText($('h4 + p').first());

    const schemas: Schema[] = [];
    const methods: Method[] = [];

    // Find and iterate through every table element
    $('table').each((_, element) => {
        const $element = $(element);

        // Backtrack to the nearest h4, which we assume is the heading for that table
        const name = getText(getHeading($element, 'h4'));

        // Backtrack to the nearest h3, which we assume is the heading for the category
        const categoryName = getText(getHeading($element, 'h3'));
        const category = CATEGORIES[categoryName] || 'unknown';

        const description = getText(
            $element
                .prevUntil('h4')
                .map((_, p) => getText(p))
                .get()
                .join('\n')
        );

        // If the first letter is uppercase, we can assume its a schema
        if (isUpperCase(name.charAt(0))) {
            schemas.push({
                type: 'schema',
                name,
                description,
                category,
                // We map each row in the table to its own field
                fields: getTableRows($element).map(row => {
                    const [name, type, description] = getChildText(row);

                    return {
                        name,
                        type: parseType(type),
                        description,
                        // Methods have a separate column for optional, which is what this checks
                        optional: description.includes('Optional'),
                    };
                }),
            });

            return;
        }

        // Otherwise, it's a method
        methods.push({
            type: 'method',
            name,
            description,
            category,
            fields: getTableRows($element).map(row => {
                const [name, type, optional, description] = getChildText(row);

                return {
                    name,
                    type: parseType(type),
                    description,
                    // Methods have a separate column for optional, which is what this checks
                    optional: optional.includes('Optional'),
                };
            }),
            returnType: parseType('unknown'),
        });
    });

    return {
        version,
        schemas: sortBy(schemas, schema => schema.name),
        methods: sortBy(methods, method => method.name),
    };
};
