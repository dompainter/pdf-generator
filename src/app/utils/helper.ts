import postcss from 'postcss';
import cssjs, { CssInJs } from 'postcss-js';
import sectionMockJson from '../mocks/sections.json';
import { MockDocumentDataType } from '../types/document.type';

const allKeysToReplace = [
  '${this.title}',
  '${this.jobTitle}',
  '${this.datePeriod}',
  '${this.organisation}',
  '${this.organisationDescription}',
  '${this.description}',
  '${this.institution}',
  '${this.degreeName}',
  '${this.gpa}',
  '${this.phone}',
  '${this.email}',
  '${this.location}',
  '${this.image}',
  '${this.name}',
  '${this.date}',
  '${this.language}',
  '${this.hobby}',
  '${this.stack}',
  '${this.accomplishmentTitle}',
  '${this.accomplishmentDescription}',
];

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
  const sectionData: any = dataToConsider.sections;

  let headerGlobalCss: string = '';
  let globalFontFamily: string = '';
  let globalFontSize: string = '';
  let headerBackgroudColor: string = '';

  if (dataToConsider.styles.GLOBAL.backgroundColor) {
    headerBackgroudColor = dataToConsider.styles.GLOBAL.backgroundColor;
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

    // iterate over the keys to replace
    allKeysToReplace.forEach((keyToReplace) => {
      const keyToReplaceRegex = new RegExp('\\' + keyToReplace, 'g');

      const keyToReplaceValue =
        sectionDetails.body[0][keyToReplace.split('${this.')[1].split('}')[0]];

      currSectionSchema.component = currSectionSchema.component.replace(
        keyToReplaceRegex,
        keyToReplaceValue
      );

      const keyToReplaceTitle =
        sectionDetails.header[keyToReplace.split('${this.')[1].split('}')[0]];

      if (keyToReplace === '${this.image}' && keyToReplaceTitle) {
        imageUrl = keyToReplaceTitle;
      }

      currSectionSchema.titleComp = currSectionSchema.titleComp.replace(
        keyToReplaceRegex,
        keyToReplaceTitle
      );
    });

    if (currSectionSchema.isStaticHeader) {
      headerHtml += `
        <div style="${headerGlobalCss}; padding: 15px 30px 15px 30px;">
          ${currSectionSchema.titleComp}
        </div>`;
    }

    if (!currSectionSchema.isStaticHeader) {
      const sectionHtml = `
      <div>
        ${currSectionSchema.titleComp}
        ${currSectionSchema.component}
      </div>`;

      if (sectionDetails.columnIndex === 0) {
        firstColumnHtml[sectionDetails.positionIndex] = `
          <div style="padding-bottom: 15px; padding-top: 15px;">
          ${sectionHtml}
          </div>
        `;
      } else {
        secondColumnHtml[sectionDetails.positionIndex] = `
          <div style="padding-bottom: 15px; padding-top: 15px;">
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
    <div style="padding: 15px 30px 15px 30px;">
        ${firstColumnHtml.join('')}
      </div>`;
  }

  if (secondColumnHtml.length > 0) {
    secondColFinalHtml += `
      <div style="padding: 15px 30px 15px 30px;">
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
    <div style="${globalFontFamily}; ${globalFontSize}; border: 50px solid ${headerBackgroudColor};">
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
