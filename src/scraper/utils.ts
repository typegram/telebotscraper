import * as cheerio from 'cheerio';

export const getHeading = (
    $element: Cheerio,
    headingType: 'h3' | 'h4'
): Cheerio => $element.prevUntil(headingType).prev(headingType);

export const getText = (thing: Cheerio | CheerioElement | string): string => {
    let text: string;
    if (typeof thing === 'string') {
        text = thing;
    } else {
        const $thing = 'cheerio' in thing ? thing : cheerio(thing);
        text = $thing.text();
    }

    return text
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/[^\w\s.,:;!?'"_/\-()[\]]<>/, replace => {
            throw new Error(
                `Found bad character '${replace}' in text: ${text}`
            );
        })
        .trim();
};

export const getTableRows = (cheerio: Cheerio): CheerioElement[] =>
    cheerio
        .find('tbody')
        .children()
        .toArray();

export const getChildText = (element: CheerioElement): string[] =>
    cheerio(element)
        .children()
        .map((_, child) => getText(child))
        .get();

export const isUpperCase = (text: string): boolean =>
    text === text.toUpperCase();

export const sortBy = <T>(array: T[], getSortKey: (arg0: T) => string): T[] =>
    array.sort((a, b) => {
        const keyA = getSortKey(a);
        const keyB = getSortKey(b);
        return keyA.localeCompare(keyB);
    });
