# PDF Generator

The purpose of this repository is to create and download a PDF file based on the structure, styles and values of a view of a document.
An example desired output is similar to canva. Based on how a page looks, the file that is downloaded should match how it seems in the UX.

## STACK

- FE: React & Redux
- BE: NodeJS & Express
- DB: MongoDB (but data is just mocked JSON files for this purpose)

## REQUIREMENTS:

- PDF output only
- A4 pages only
- Text/Links must be intractable from the PDF (can’t just be an image of the document)
- The user interface represents a document editor and the file that is downloaded should match what is shown to the user

## Data structure

An A4 Document made up of:

- Pages
- Styles
  -- `documentStyles.css` has the sizing and display for specific elements of the file
  -- Additional styles can be set as per the document "styles" config.
- Layout
  -- Full width, split page (2 columns)
- Sections
  -- Sections are made up of a header and “body”.
  --- header and body are specific HTML/JSX layouts with references to fields.
  -- header and body are made up of fields
  --- Fields can be hidden by the user meaning anything that’s shown on the UI should be downloaded. Hidden content should not be visible.
  -- “body” is an array editable fields (as there can be multiple)
  -- When in full width mode on the layout, a section can have half width or full width set
- A document can have MULTIPLE pages
- A document has a specific layout (either full width or 2 columns which is applied to all pages)
- A page can have MULTIPLE sections
- Sections are set in an order (position index and column index)
- A document can have specific styling rules
  -- Accent colour (only applied to one section)
  -- Image (only applied to one section)
  -- Font style
  -- Font size (a single “em” value is set and applied to all titles, copy etc)
  -- Icons (either are visible or are not)
- All of the above are available from a single document in the mock files.

### DOCUMENT CONFIG

```shell
{
    "columnLayout": 1, // Whether the document is in 1 column or 2 columns
    "sections": { // Sections that are present on the document and there values
        "6631996027584979ba41b31e": {
            "header": { // Values for all fields in the header
                "name": "John Doe", // Value for the profile sections name field (see section config)
                "phone": "012345678901",
                "email": "email@email.com",
                "location": "123 Bondi Beach, NSW",
                "image": "https://s3.ap-southeast-2.amazonaws.com/local.1template.com/common/default_female.png"
            },
            "body": [
                {}
            ],
            "hiddenFields": [ // String array of fields that should NOT be visible on downloaded document
                "location"
            ],
            "activeWidth": "full", // The width of the section (can be full or half)
            "columnIndex": 0, // Zero index column position (can be 0 or 1) to represent column to display in
            "positionIndex": 0, // Zero index position index to represent the order in which sections should be vertically
            "sectionName": "Profile"
        },
        "64abae2ce0be3ace8df356f2": {
            "header": {
                "title": "Education"
            },
            "body": [ // Array of items and their values that should be rendered in the body. Each array item should be rendered as per the component value for the section (see section config)
                {
                    "institution": "University of Sydney",
                    "degreeName": "Bachelor of Business Administation",
                    "gpa": "GPA: 3.9/4.0",
                    "description": "I acquired a comprehensive understanding of fundamental business principles including finance, management, marketing, and operations, equipping me with the knowledge and skills necessary for strategic decision-making and effective leadership in diverse organisational settings."
                }
            ],
            "hiddenFields": [],
            "activeWidth": "full",
            "columnIndex": 0,
            "positionIndex": 1,
            "sectionName": "EDUCATION"
        },
    },
    "name": "My document", // Downloaded file should have this name
    "styles": {
        "GLOBAL": {
            "fontFamily": "Poppins, sans-serif", // Font family for entire document
            "fontSize": "15px", // Font size to be applied to document (all elements are em styling)
            "backgroundColor": "#AAADDD", // Background colour to be applied to sticky header section if present
            "showIcons": true // Boolean value of whether to display specific icons
        }
    },
}
```

### SECTION CONFIG

```shell
{
    // Unique identifier
    "_id": "64abadf8e0be3ace8df356dd",
    "name": "EXPERIENCE",
    // HTML to be used to display this sections TITLE
    "titleComp": "<h1 id='title'>${this.title}</h1>",
    // HTML to be used to display this sections BODY (note: each body item should have this shape)
    "component": "<div>\n<h3 id=\"jobTitle\">${this.jobTitle}</h3>\n<span id=\"datePeriod\">${this.datePeriod}</span>\n<div class=\"flex gap-3\">\n<h4 id=\"organisation\">${this.organisation}</h4>\n<h4 id=\"organisationDescription\">${this.organisationDescription}</h4>\n</div>\n<p id=\"description\">${this.description}</p>\n</div>",
    // If true, this section must be at the top of the document
    "isStaticHeader": false
}
```

## MOCK DATA

The `/mocks` folder contains 3 files:

1. `sections.js` - This is an array of configs for sections.
2. `2-page-document` - This is a document object that has a lot of sections and should display across 2 pages in the downloaded file
3. `2-column-document` - This is a document object that displays content in 2 column instead of 1

## Developing

```shell
npm install
```

This will install the dependencies required to run the boilerplate.

```shell
npm run dev
```

The default PORTS are:

- `3001` for the server
- `3000` for the client

If you don't like to call all scripts at once, you can also run:

```shell
npm run server:dev
npm run client:dev
```
