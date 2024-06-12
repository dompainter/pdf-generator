import postcss from 'postcss';
import cssjs, { CssInJs } from 'postcss-js';
import sectionMockJson from '../mocks/sections.json';
import { MockDocumentDataType, SectionsType } from '../types/document.type';

const innerPadding = 'padding: 15px 30px 15px 30px;';
const sectionColumnTopBottomPadding =
  'padding-bottom: 15px; padding-top: 15px;';
const bodyItemTopPadding = 'padding-top: 10px;';

const replaceAllKeyWithValue = (
  html: string,
  key: string,
  value: string
): string => {
  const keyToReplace = new RegExp('\\${this.' + key + '}', 'g');
  return html.replace(keyToReplace, value);
};

async function convertImageToDataURI(
  imageUrl: string
): Promise<string | ArrayBuffer | null> {
  // Fetch the image from the URL
  const response = await fetch(imageUrl);

  // Check if the fetch was successful
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // Convert the response to a Blob
  const blob = await response.blob();

  // Create a FileReader to read the Blob as a data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Set up the onload event to resolve the promise with the data URL
    reader.onloadend = () => resolve(reader.result);

    // Set up the onerror event to reject the promise
    reader.onerror = () => reject('Failed to convert blob to data URL');

    // Read the Blob as a data URL
    reader.readAsDataURL(blob);
  });
}

export const toCSS = async function (js: string): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      let val: CssInJs = {};
      eval(`val = ${js}`);
      postcss()
        // @ts-ignore
        .process(val, { parser: cssjs })
        .then((code) => resolve(code.css))
        .catch((err) => reject(err));
    });
  } catch (err) {
    console.error("Couldn't convert JS to CSS.", err);
    return '';
  }
};

export const generateHtml = async (document: MockDocumentDataType) => {
  const dataToConsider = document;
  const documentName = dataToConsider.name;
  const sectionData: SectionsType = dataToConsider.sections;

  let headerGlobalCss: string = '';
  let globalFontFamily: string = '';
  let globalFontSize: string = '';

  if (dataToConsider.styles.GLOBAL.backgroundColor) {
    const backgroundColorJson = {
      backgroundColor: dataToConsider.styles.GLOBAL.backgroundColor,
    };

    headerGlobalCss = await toCSS(JSON.stringify(backgroundColorJson));
  }

  if (dataToConsider.styles.GLOBAL.fontFamily) {
    const fontFamilyJson = {
      fontFamily: dataToConsider.styles.GLOBAL.fontFamily,
    };

    globalFontFamily = await toCSS(JSON.stringify(fontFamilyJson));
  }

  if (dataToConsider.styles.GLOBAL.fontSize) {
    const fontSizeJson = {
      fontSize: dataToConsider.styles.GLOBAL.fontSize,
    };

    globalFontSize = await toCSS(JSON.stringify(fontSizeJson));
  }

  let htmlData: string = '';
  let headerHtml = '';
  let firstColumnHtml: string[] = [];
  let secondColumnHtml: string[] = [];
  let imageUrl = '';

  // iterate over the sections keys
  const keys: string[] = Object.keys(sectionData);
  keys.forEach((key: string) => {
    const sectionDetails = sectionData[key];

    const allBodyObj = sectionDetails.body.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    const allKeysValues = {
      ...sectionDetails.header,
      ...allBodyObj,
    };

    const imageTagValue = allKeysValues['image'];

    if (imageTagValue) {
      imageUrl = imageTagValue;
    }

    const currSectioName = sectionDetails.sectionName;

    const currSectionSchema = sectionMockJson.find(
      (section) => section.name === currSectioName
    );
    if (!currSectionSchema) return;

    // we also need to remove the <img tag from the titleComp as we'll be adding it via jspdf
    currSectionSchema.titleComp = currSectionSchema.titleComp.replace(
      /<img[^>]*>/g,
      ''
    );

    if (currSectionSchema.isStaticHeader) {
      let headerStaticUpdatedComponent: string = currSectionSchema.titleComp;

      // replace all the keys with values in the header if present
      if (Object.keys(sectionDetails.header).length) {
        Object.keys(sectionDetails.header).forEach((headerItem) => {
          headerStaticUpdatedComponent = replaceAllKeyWithValue(
            headerStaticUpdatedComponent,
            headerItem,
            sectionDetails.header[headerItem]
          );
        });
      } else {
        headerStaticUpdatedComponent = currSectionSchema.titleComp;
      }

      // add updated header to the headerHtml
      headerHtml += `
        <div style="${headerGlobalCss}; ${innerPadding}">
          ${headerStaticUpdatedComponent}
        </div>`;
    }

    // replace all the keys with values in the non-static header if present
    if (!currSectionSchema.isStaticHeader) {
      let headerNonStaticUpdatedComponent: string = currSectionSchema.titleComp;

      if (Object.keys(sectionDetails.header).length) {
        Object.keys(sectionDetails.header).forEach((headerItem) => {
          headerNonStaticUpdatedComponent = replaceAllKeyWithValue(
            headerNonStaticUpdatedComponent,
            headerItem,
            sectionDetails.header[headerItem]
          );
        });
      } else {
        headerNonStaticUpdatedComponent = currSectionSchema.titleComp;
      }

      const sectionHtml = `
      <div>
        ${headerNonStaticUpdatedComponent}
        ${
          sectionDetails.body
            ? sectionDetails.body
                .map((bodyItem) => {
                  let bodyUpdatedComponent = currSectionSchema.component;
                  Object.keys(bodyItem).forEach((key) => {
                    bodyUpdatedComponent = replaceAllKeyWithValue(
                      bodyUpdatedComponent,
                      key,
                      bodyItem[key]
                    );
                  });
                  return `<div style="${bodyItemTopPadding}">${bodyUpdatedComponent}</div>`;
                })
                .join('')
            : currSectionSchema.component
        }
      </div>`;

      if (sectionDetails.columnIndex === 0) {
        firstColumnHtml[sectionDetails.positionIndex] = `
          <div style="${sectionColumnTopBottomPadding}">
          ${sectionHtml}
          </div>
        `;
      } else {
        secondColumnHtml[sectionDetails.positionIndex] = `
          <div style="${sectionColumnTopBottomPadding}">
          ${sectionHtml}
          </div>
        `;
      }
    }
  });

  if (headerHtml) {
    htmlData = `
      <div style="display: block;">
        ${headerHtml}
      </div>`;
  }

  let firstColFinalHtml = '';
  let secondColFinalHtml = '';

  if (firstColumnHtml.length > 0) {
    firstColFinalHtml += `
    <div style="${innerPadding}">
        ${firstColumnHtml.join('')}
      </div>`;
  }

  if (secondColumnHtml.length > 0) {
    secondColFinalHtml += `
      <div style="${innerPadding}">
        ${secondColumnHtml.join('')}
      </div>`;
  }

  if (firstColFinalHtml && secondColFinalHtml) {
    htmlData += `
      <div class="flex gap-2">
        ${firstColFinalHtml}
        ${secondColFinalHtml}
      </div>`;
  } else {
    htmlData += firstColFinalHtml || secondColFinalHtml;
  }

  const finalHtmlData = `
    <div style="${globalFontFamily}; ${globalFontSize};">
      ${htmlData}
    </div>`;

  let imageUri: string | ArrayBuffer | null = '';
  if (imageUrl) {
    imageUri = await convertImageToDataURI(imageUrl);
  }

  return {
    finalHtmlData,
    imageUri,
    documentName,
  };
};
