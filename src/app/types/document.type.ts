type HeaderType = {
  [key: string]: string;
};

type BodyItemType = {
  [key: string]: string;
};

export type SectionType = {
  header: HeaderType;
  body: BodyItemType[];
  hiddenFields: string[];
  activeWidth: string;
  columnIndex: number;
  positionIndex: number;
  sectionName: string;
};

export type SectionsType = {
  [key: string]: SectionType;
};

type StylesType = {
  fontFamily: string;
  fontSize: string;
  backgroundColor: string;
  showIcons: boolean;
};

export type MockDocumentDataType = {
  columnLayout: number;
  sections: SectionsType;
  name: string;
  styles: {
    GLOBAL: StylesType;
  };
};
