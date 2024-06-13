import postcss from 'postcss';
import cssjs, { CssInJs } from 'postcss-js';
import sectionMockJson from '../mocks/sections.json';
import { MockDocumentDataType, SectionsType } from '../types/document.type';

// CSS styles
const innerPadding = 'padding: 15px 30px 15px 30px;';
const sectionColumnTopBottomPadding =
  'padding-bottom: 15px; padding-top: 15px;';
const bodyItemTopPadding = 'padding-top: 10px;';
const firstColumnWidth = 'width: 66.66%;';
const secondColumnWidth = 'width: 33.33%;';
const rightHalfColumnPadding = 'padding-right: 30px;';

// Replaces all occurrences of a specific key within a given string with a provided value.
const replaceAllKeyWithValue = (
  html: string,
  key: string,
  value: string
): string => {
  const keyToReplace = new RegExp('\\${this.' + key + '}', 'g');
  return html.replace(keyToReplace, value);
};

// Converts an image URL to a data URI.
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

// Converts a JavaScript object to CSS.
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

// Generates an HTML document from a given document data object.
export const generateHtml = async (dataToConsider: MockDocumentDataType) => {
  const documentName: string = dataToConsider.name;
  const sectionData: SectionsType = dataToConsider.sections;

  let headerGlobalCss: string = '';
  let globalFontFamily: string = '';
  let globalFontSize: string = '';

  // check if global styles are present for background color
  if (dataToConsider.styles.GLOBAL.backgroundColor) {
    const backgroundColorJson = {
      backgroundColor: dataToConsider.styles.GLOBAL.backgroundColor,
    };

    headerGlobalCss = await toCSS(JSON.stringify(backgroundColorJson));
  }

  // check if global styles are present for font family
  if (dataToConsider.styles.GLOBAL.fontFamily) {
    const fontFamilyJson = {
      fontFamily: dataToConsider.styles.GLOBAL.fontFamily,
    };

    globalFontFamily = await toCSS(JSON.stringify(fontFamilyJson));
  }

  // check if global styles are present for font size
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
  let singleColumnHtml: string[] = [];
  let halfLengthHtml: string[] = [];
  let imageUrl = '';
  let imageUri: string | ArrayBuffer | null = '';

  // iterate over the sections keys
  const keys: string[] = Object.keys(sectionData);
  for (const key of keys) {
    const sectionDetails = sectionData[key];

    const allBodyObj = sectionDetails.body.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    // merge the header and body object to get all the keys and values
    const allKeysValues: Record<string, string> = {
      ...sectionDetails.header,
      ...allBodyObj,
    };

    // check if image key is present in the keys
    const imageTagValue: string = allKeysValues['image'];

    // if image key is present, then we need to update the imageUrl
    if (imageTagValue) {
      imageUrl = imageTagValue;
      if (imageUrl) {
        imageUri = await convertImageToDataURI(imageUrl);
        allKeysValues['image'] = String(imageUri);
      }
    }

    const currSectioName = sectionDetails.sectionName;

    // find the schema for the current section
    const currSectionSchema = sectionMockJson.find(
      (section) => section.name === currSectioName
    );

    if (!currSectionSchema) {
      return {
        finalHtmlData: '',
        imageUri: '',
        documentName: '',
      };
    }

    // check if the header is static i.e main header
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

      const sectionHtml: string = `
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

      // check if the column layout is 2
      if (dataToConsider.columnLayout === 2) {
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
      } else {
        if (sectionDetails.activeWidth === 'full') {
          if (halfLengthHtml.length) {
            singleColumnHtml.push(`
              <div style="${sectionColumnTopBottomPadding} display:flex;">
              ${halfLengthHtml.join('')}
              </div>
            `);
            // reset the halfLengthHtml for the next iteration
            halfLengthHtml = [];
          }

          singleColumnHtml.push(`
            <div style="${sectionColumnTopBottomPadding} width: 100%;">
            ${sectionHtml}
            </div>
          `);
        } else if (sectionDetails.activeWidth === 'half') {
          let halfSectionPadding = '';
          if (halfLengthHtml.length === 0) {
            halfSectionPadding = rightHalfColumnPadding;
          }
          halfLengthHtml.push(`
            <div style="width: 50%; ${halfSectionPadding}">
            ${sectionHtml}
            </div>
          `);
        }
      }
    }
  }

  // add headerHtml to the htmlData
  if (headerHtml) {
    htmlData = `
      <div style="display: block;">
        ${headerHtml}
      </div>`;
  }

  // check if the column layout is 2 and add the first and second column html to the htmlData
  if (dataToConsider.columnLayout === 2) {
    let firstColFinalHtml = '';
    let secondColFinalHtml = '';
    if (firstColumnHtml.length > 0) {
      firstColFinalHtml += `
      <div style="${innerPadding} ${firstColumnWidth}">
          ${firstColumnHtml.join('')}
        </div>`;
    }

    if (secondColumnHtml.length > 0) {
      secondColFinalHtml += `
        <div style="${innerPadding} ${secondColumnWidth}">
          ${secondColumnHtml.join('')}
        </div>`;
    }

    if (firstColFinalHtml && secondColFinalHtml) {
      htmlData += `
        <div style="display: flex;">
          ${firstColFinalHtml}
          ${secondColFinalHtml}
        </div>`;
    } else {
      htmlData += firstColFinalHtml || secondColFinalHtml;
    }
  } else {
    htmlData += `
      <div style="${innerPadding}">
        ${singleColumnHtml.join('')}
      </div>`;
  }

  // enclosing the htmlData in a div with global styles
  const finalHtmlData = `
    <div style="${globalFontFamily}; ${globalFontSize};">
      ${htmlData}
    </div>`;

  return {
    finalHtmlData,
    imageUri,
    documentName,
  };
};
