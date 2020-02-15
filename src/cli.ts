import { writeFileSync } from 'fs';

import { outputFile } from 'fs-extra';

import { scrape } from './scraper';
import { transform } from './transformer';

scrape().then(result => {
    writeFileSync('data.json', JSON.stringify(result, null, 2));

    transform(result).forEach(result =>
        outputFile(result.outputPath, result.output)
    );
});
