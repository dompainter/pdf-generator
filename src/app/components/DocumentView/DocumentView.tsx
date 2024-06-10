import React, { useCallback } from 'react';
import twoColumnDocument from '../../mocks/2-column-document.json';
import twoPageDocument from '../../mocks/2-page-document.json';
import { MockDocumentDataType } from '../../types/document.type';
import { generateHtml } from '../../utils/helper';
import PDFConverter from '../PdfConverter/PdfConverter';
import './documentStyles.css';

const DocumentView = () => {
  const [isPdfGenerated, setIsPdfGenerated] = React.useState(false);
  const [htmlData, setHtmlData] = React.useState<string>('');
  const [imageUri, setImageUri] = React.useState<string | ArrayBuffer | null>(
    ''
  );
  const [documentName, setDocumentName] = React.useState<string>('');
  const onGenerate = useCallback(async (document: MockDocumentDataType) => {
    const { finalHtmlData, imageUri, documentName } = await generateHtml(
      document
    );

    setDocumentName(documentName);
    setImageUri(imageUri);

    setHtmlData(finalHtmlData);
    setIsPdfGenerated(true);
  }, []);

  return (
    <div className="px-12 py-6">
      <div className="flex gap-3">
        <div className="flex gap-3">
          <button
            className="bg-blue-100 p-4 mt-4 ring-2 rounded-lg ring-blue-500"
            onClick={() => onGenerate(twoColumnDocument)}
          >
            Generate 2 Column Document
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="bg-blue-100 p-4 mt-4 ring-2 rounded-lg ring-blue-500"
            onClick={() => onGenerate(twoPageDocument)}
          >
            Generate 2 Page Document
          </button>
        </div>
      </div>
      {isPdfGenerated && htmlData && (
        <PDFConverter
          getContent={[
            <div
              dangerouslySetInnerHTML={{
                __html: htmlData,
              }}
              className="document-view"
            />,
          ]}
          margin={[0, 0, 0, 0]}
          scale={0.6}
          increasedWidth={400}
          xMargin={0}
          imageUri={imageUri}
          documentName={documentName}
        />
      )}
      <div
        dangerouslySetInnerHTML={{
          __html: htmlData,
        }}
        className="document-view"
      />
    </div>
  );
};

export default DocumentView;
