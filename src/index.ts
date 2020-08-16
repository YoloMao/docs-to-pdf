import chalk = require('chalk');
import puppeteer = require('puppeteer');
import { PDFDocument } from 'pdf-lib';

import * as fs from 'fs';

const generatedPdfBuffers: Array<Buffer> = [];

async function mergePdfBuffers(pdfBuffers: Array<Buffer>) {
  const outputDoc = await PDFDocument.create();
  for (const pdfBuffer of pdfBuffers) {
    const docToAdd = await PDFDocument.load(pdfBuffer);
    const pages = await outputDoc.copyPages(
      docToAdd,
      docToAdd.getPageIndices(),
    );
    for (const page of pages) {
      outputDoc.addPage(page);
    }
  }

  return outputDoc.save();
}

export interface generatePdfOptions {
  initialUrl: string;
  outputPdfFilename: string;
  pdfMargin: puppeteer.PDFOptions['margin'];
  paginationSelector: string;
  pdfFormat: puppeteer.PDFFormat;
  excludeSelectors: Array<string>;
  cssStyle: string;
  puppeteerArgs: Array<string>;
}

export async function generatePdf({
  initialUrl,
  outputPdfFilename = 'docusaurus.pdf',
  pdfMargin,
  paginationSelector,
  pdfFormat,
  excludeSelectors,
  cssStyle,
  puppeteerArgs,
}: generatePdfOptions): Promise<void> {
  const browser = await puppeteer.launch({ args: puppeteerArgs });
  const page = await browser.newPage();

  let nextPageUrl = initialUrl;

  while (nextPageUrl) {
    console.log();
    console.log(chalk.cyan(`Generating PDF of ${nextPageUrl}`));
    console.log();

    await page.goto(`${nextPageUrl}`, { waitUntil: 'networkidle2' });

    // Find next page url before DOM operations
    try {
      nextPageUrl = await page.$eval(paginationSelector, (element) => {
        return (element as HTMLLinkElement).href;
      });
    } catch (e) {
      nextPageUrl = '';
    }

    // Remove unnecessary part to be printed by using excludeSelectors from page
    excludeSelectors &&
      excludeSelectors.map(async (excludeSelector) => {
        // "selector" is equal to "excludeSelector"
        // https://pptr.dev/#?product=Puppeteer&version=v5.2.1&show=api-pageevaluatepagefunction-args
        await page.evaluate((selector) => {
          const matches = document.querySelectorAll(selector);
          matches.forEach((match) => match.remove());
        }, excludeSelector);
      });

    // Add css style
    await page.addStyleTag({ content: cssStyle });

    const pdfBuffer = await page.pdf({
      path: '',
      format: pdfFormat,
      printBackground: true,
      margin: pdfMargin,
    });

    generatedPdfBuffers.push(pdfBuffer);

    console.log(chalk.green('Success'));
  }
  await browser.close();

  const mergedPdfBuffer = await mergePdfBuffers(generatedPdfBuffers);
  fs.writeFileSync(`${outputPdfFilename}`, mergedPdfBuffer);
}
