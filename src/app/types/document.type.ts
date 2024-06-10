type HeaderType = {
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  image?: string;
  title?: string;
};

type BodyItemType = {
  jobTitle?: string;
  organisation?: string;
  organisationDescription?: string;
  accomplishmentTitle?: string;
  accomplishmentDescription?: string;
  hobby?: string;
  description?: string;
  datePeriod?: string;
  institution?: string;
  degreeName?: string;
  gpa?: string;
  name?: string;
  __id?: string;
  date?: string;
  language?: string;
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

type SectionsType = {
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
