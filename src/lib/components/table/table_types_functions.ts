import Decimal from "decimal.js";

export type TableDocument = {
    metadata: TableMetadata;
    records: TableRecord[];
};

type TableMetadata = {
    [column: string]: {
        data_type: "integer" | "decimal" | "string" | "timestamp" | "tag";
        display: {
            text?: TextDisplay;
            tag?: TagDisplay;
        };
    };
};

type ColumnDisplay = {
    name: string;
};

type TextDisplay = {
    trimmable: boolean;
} & ColumnDisplay;

type TagDisplay = {
    options: TagOption[];
} & ColumnDisplay;

type TagOption = {
    name: string;
    color: TagColor;
};

type TagColor = PresetColor | RGBAColor;

type PresetColor = {
    name: string;
    opacity: number;
};

type RGBAColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export type TableRecord = {
    [column: string]: CellValue;
};

type CellValue = {
    value: number | string | Decimal | Date;
    formatted: string | null;
};

export type Selector = {
    options: NamedItem[];
    selected: string[];
};

export type NamedItem = {
    true_name: string;
    display_name: string;
};


export type Filter = {
    columns: string[];
    criteria: StringCriteria | NumericCriteria | DateCriteria;
};

export type StringCriteria = {
    regex: boolean;
    value: string;
    type: "string_criteria";
};

export type NumericCriteria = {
    operator: "greater_than" | "less_than" | "equals";
    value: number;
    type: "numeric_criteria";
};

export type DateCriteria = {
    operator: "after" | "before" | "on";
    value: Date;
    type: "date_criteria";
};

export function getTagColor(
    tagDisplay: TagDisplay | undefined,
    tag_variant: string,
): { value: string; opacity: number } {
    const tagOption = tagDisplay?.options.find(
        (option) => option.name === tag_variant,
    );
    const tagColorIfPreset = tagOption?.color as PresetColor;
    const tagColorIfRGBA = tagOption?.color as RGBAColor;

    if (tagColorIfPreset) {
        return {
            value: tagColorIfPreset.name,
            opacity: tagColorIfPreset.opacity * 100,
        };
    } else if (tagColorIfRGBA) {
        return {
            value: `rgb(${tagColorIfRGBA.r}, ${tagColorIfRGBA.g}, ${tagColorIfRGBA.b})`,
            opacity: tagColorIfRGBA.a * 100,
        };
    } else {
        return {
            value: "gray",
            opacity: 100,
        };
    }
}

export function parseRecordDataTypes(tableDocument: TableDocument) {
    for (const [column_name, column_metadata] of Object.entries(
        tableDocument.metadata,
    )) {
        if (column_metadata.data_type === "decimal") {
            for (let record of tableDocument.records) {
                if (record[column_name].value) {
                    record[column_name].value = new Decimal(
                        record[column_name].value.toString(),
                    );
                }
            }
        } else if (column_metadata.data_type === "timestamp") {
            for (let record of tableDocument.records) {
                if (record[column_name].value) {
                    record[column_name].value = new Date(
                        record[column_name].value.toString(),
                    );
                }
            }
        }
    }
}

export function isSearchMatch(tableDocument: TableDocument, record: TableRecord, query: string): boolean {
    if (query === "") {
        return true;
    }

    const searchQueryLower = query.toLowerCase();
    for (const column of Object.keys(tableDocument.metadata)) {
        const cellDisplay = (
            record[column].formatted ?? record[column].value.toString()
        ).toLowerCase();
        if (cellDisplay.includes(searchQueryLower)) {
            return true;
        }
    }

    return false;
}

export function isFilterMatch(
    record: TableRecord,
    filters: Filter[],
): boolean {
    for (const filter of filters) {
        const criteria = filter.criteria;

        for (const column of filter.columns) {
            const cellValue = record[column].value;
            const cellDisplay =
                record[column].formatted ?? cellValue.toString();

            if (criteria.type === "string_criteria") {
                if (criteria.regex) {
                    const regex = new RegExp(criteria.value);
                    if (!regex.test(cellDisplay)) {
                        return false;
                    }
                } else {
                    if (!cellDisplay.includes(criteria.value)) {
                        return false;
                    }
                }
            } else if (criteria.type === "numeric_criteria") {
                switch (criteria.operator) {
                    case "greater_than":
                        if (!(Number(cellValue) > criteria.value)) {
                            return false;
                        }
                        break;
                    case "less_than":
                        if (!(Number(cellValue) < criteria.value)) {
                            return false;
                        }
                        break;
                    case "equals":
                        if (Number(cellValue) !== criteria.value) {
                            return false;
                        }
                        break;
                }
            } else if (criteria.type === "date_criteria") {
                switch (criteria.operator) {
                    case "after":
                        if (!(cellValue > criteria.value)) {
                            return false;
                        }
                        break;
                    case "before":
                        if (!(cellValue < criteria.value)) {
                            return false;
                        }
                        break;
                    case "on":
                        if (cellValue !== criteria.value) {
                            return false;
                        }
                        break;
                }
            }
        }
    }

    return true;
}

export function compare(
    tableDocument: TableDocument,
    a: TableRecord,
    b: TableRecord,
    selectedSortColumn: string,
    ascendingSort: boolean,
) {
    let valueA = a[selectedSortColumn].value;
    let valueB = b[selectedSortColumn].value;

    if (valueA === null) {
        return 1;
    }

    if (valueB === null) {
        return -1;
    }

    // ? Does this need to be handled? It seems like the values are already being correctly compared
    const recordType =
        tableDocument.metadata[selectedSortColumn].data_type;

    if (recordType === "integer" || recordType === "decimal") {
        valueA = Number(valueA);
        valueB = Number(valueB);
    }

    if (ascendingSort) {
        if (valueA < valueB) {
            return -1;
        }
        if (valueA > valueB) {
            return 1;
        }
    } else {
        if (valueA < valueB) {
            return 1;
        }
        if (valueA > valueB) {
            return -1;
        }
    }

    return 0;
}

export function getFilteredRecords(
    tableDocument: TableDocument,
    mode: string,
    searchQuery: string,
    filters: Filter[],
): TableRecord[] {
    const searchMode = mode === "search";
    const filterMode = mode === "filter";

    let filteredRecords = [];

    for (const record of tableDocument.records) {
        if (searchMode && isSearchMatch(tableDocument, record, searchQuery)) {
            filteredRecords.push(record);
        } else if (filterMode && isFilterMatch(record, filters)) {
            filteredRecords.push(record);
        }
    }

    return filteredRecords;
}

export function allColumnsNumeric(tableDocument: TableDocument, selectedColumns: Selector) {
    return allColumnsAreType(tableDocument, selectedColumns, ["decimal", "integer"]);
}

export function allColumnsDate(tableDocument: TableDocument, selectedColumns: Selector) {
    return allColumnsAreType(tableDocument, selectedColumns, ["timestamp"]);
}

function allColumnsAreType(tableDocument: TableDocument, selectedColumns: Selector, types: string[]) {
    for (const column_name of selectedColumns.selected) {
        const column = tableDocument.metadata[column_name];
        if (column && !types.includes(column.data_type)) {
            return false;
        }
    }

    return true;
}
