namespace RideStylerShowcase {
    import Column = RideStylerShowcaseTable.Column;
    import Options = RideStylerShowcaseTable.Options;

    const tableClass = 'ridestyler-showcase-table';
    const headClass = tableClass + '-head';
    const bodyClass = tableClass + '-body';
    const bodyLoadingClass = bodyClass + '-loading';
    const containerClass = tableClass + '-container';

    export class RideStylerShowcaseTable<RowType> extends ComponentBase {
        protected readonly options:Options<RowType>;
        protected readonly columns:Column<RowType>[];

        protected tbody:HTMLTableSectionElement;

        public static emptyCellString:string = '-';

        constructor(showcaseInstance:RideStylerShowcaseInstance, options:Options<RowType>) {
            options = ObjectHelper.assign({

            }, options) 

            super(showcaseInstance);

            this.options = options;
            this.columns = options.columns;
            
            let table = HTMLHelper.createElement('table', {
                appendTo: this.component,
                className: tableClass
            });

            let thead = HTMLHelper.createElement('thead', {
                appendTo: table,
                className: headClass
            });

            this.tbody = HTMLHelper.createElement('tbody', {
                appendTo: table,
                className: bodyClass
            });

            this.generateHeaders(thead);

            this.component = table;

            if (options.rows) this.appendRows(options.rows);
            else if (options.startLoading) this.setLoading(true);
        }

        protected generateHeaderCell(column:Column<RowType>):HTMLTableHeaderCellElement {
            let header = column.header;

            if (typeof header === 'function') {
                let generatedHeader = header(column);

                return typeof generatedHeader === 'string' ? HTMLHelper.createElement('th', {
                    text: generatedHeader
                }) : generatedHeader;
            }

            let th = HTMLHelper.createElement('th', {
                text: header
            });

            return th;
        }

        protected generateHeaders(thead:HTMLTableSectionElement) {
            let headerRow = HTMLHelper.createElement('tr');

            for (let column of this.columns) {
                headerRow.appendChild(this.generateHeaderCell(column));    
            }

            thead.appendChild(headerRow);
        }

        protected generateRowCell(row:RowType, column:Column<RowType>):HTMLTableCellElement {
            let cell = column.cell;

            if (typeof cell === 'function') {
                let generatedCell = (cell as RideStylerShowcaseTable.CellGenerator<RowType>)(row, column);

                return typeof generatedCell === 'string' ? HTMLHelper.createElement('td', {
                    text: generatedCell
                }) : generatedCell;
            }

            let td = HTMLHelper.createElement('td', {
                text: row[cell as keyof RowType].toString()
            });

            return td;
        }

        protected generateRow(row:RowType):HTMLTableRowElement {
            let tr = HTMLHelper.createElement('tr');

            for (let column of this.columns) {
                tr.appendChild(this.generateRowCell(row, column));
            }

            return tr;
        }

        public appendRows(rows:RowType[]) {
            this.setLoading(false);

            let rowsFragment = document.createDocumentFragment();

            for (let row of rows) {
                rowsFragment.appendChild(this.generateRow(row));
            }

            this.tbody.appendChild(rowsFragment);
        }

        protected setLoading(loading:boolean) {
            this.tbody.classList.toggle(bodyLoadingClass, loading);
        }

        public static formatCell<T>(object: T, key:keyof T, postfix?:string):HTMLTableCellElement {
            let string:string = object[key].toString();
            
            return HTMLHelper.createElement('td', {
                text: string ? (postfix ? string + postfix : string) : RideStylerShowcaseTable.emptyCellString
            });
        }
    }

    export namespace RideStylerShowcaseTable {
        export interface HeaderGenerator<RowType> {
            (column:Column<RowType>):HTMLTableHeaderCellElement|string;
        }

        export interface CellGenerator<RowType> {
            (row:RowType, column:Column<RowType>):HTMLTableCellElement|string;
        }

        export interface Column<RowType> {
            header: string|HeaderGenerator<RowType>;
            cell: keyof RowType|CellGenerator<RowType>;
        }

        export interface Options<RowType> {
            /**
             * Column settings
             */
            columns: Column<RowType>[];

            /**
             * Rows to initialize the table with
             */
            rows?: RowType[];

            /**
             * If true, start the table in the loading state
             */
            startLoading?: boolean;
        }
    }
}