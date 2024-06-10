/* eslint-disable no-self-assign */
/* eslint-disable react/prop-types */
/* eslint-disable new-cap */
import jsPDF from 'jspdf';
import React, { ReactElement, useCallback, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import '../../assets/Poppins-Bold-normal';
import '../../assets/Poppins-BoldItalic-normal';
import '../../assets/Poppins-Regular-normal';

interface IPDFConverter {
  getContent: ReactElement[];
  imageUri: string | ArrayBuffer | null;
  fontName?: string;
  margin?: Array<number>;
  scale?: number;
  increasedWidth?: number;
  xMargin?: number;
  documentName: string;
}

const PDFConverter = ({
  getContent,
  imageUri,
  fontName,
  margin,
  scale,
  increasedWidth,
  xMargin,
  documentName,
}: IPDFConverter) => {
  // const [uri, setUri] = useState<string>('');

  const handleConvertToPDF = useCallback(() => {
    const doc = new jsPDF('p', 'pt', 'a4', true);
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth() + (increasedWidth || 0);
    const headerHeight = 0;

    if (fontName) {
      doc.setFont(fontName);
    } else {
      doc.setFont('Arial');
    }

    if (Array.isArray(margin)) {
      margin = margin;
    } else {
      margin = [0, 0, 0, 0];
    }

    const generatePage = (index: number) => {
      if (index >= getContent.length) {
        doc.addImage(String(imageUri), 'JPEG', pageWidth - 520, 40, 70, 70);
        // const pdfDataUri = doc.output('datauristring', {
        //   filename: documentName,
        // });

        // setUri(pdfDataUri);
        doc.save(`${documentName}.pdf`);
        return;
      }

      const availableHeight = pageHeight - headerHeight;

      if (index !== 0) {
        doc.addPage('a4', 'p'); // Add a new page for each content except the first page
      }

      doc.html(ReactDOMServer.renderToString(getContent[index]), {
        callback() {
          generatePage(index + 1); // Recursively generate the next page
        },
        x: xMargin || 0,
        y: index * availableHeight + headerHeight, // Adjust the y-position based on available height and header height
        width: pageWidth,
        margin,
        autoPaging: 'text',
        windowWidth: pageWidth,
        html2canvas: {
          scale: scale || 1,
        },
      });
    };

    generatePage(0);
  }, [getContent]);
  useEffect(() => {
    if (getContent.length > 0) {
      handleConvertToPDF();
    }
  }, [getContent, handleConvertToPDF]);

  return (
    // <div id="pdf-container">
    //   {uri && <iframe src={uri} title="PDF Viewer" name="Test" />}
    // </div>
    <></>
  );
};

export default PDFConverter;
