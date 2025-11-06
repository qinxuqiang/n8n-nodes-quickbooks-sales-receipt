export interface CustomField {
	DefinitionId: string;
	StringValue?: string;
	Type?: string;
}

export interface GeneralAddress {
	City: string;
	Line1: string;
	PostalCode: string;
	Lat: string;
	Long: string;
	CountrySubDivisionCode: string;
}

export interface Ref {
	value: string;
	name?: string;
}


