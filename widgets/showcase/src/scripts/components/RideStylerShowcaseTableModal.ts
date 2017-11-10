namespace RideStylerShowcase {
    import Column = RideStylerShowcaseTableModal.Column;
    import Options = RideStylerShowcaseTableModal.Options;

    const modalClass = 'ridestyler-showcase-table-modal';
    const tableClass = modalClass + '-table';
    const headClass = tableClass + '-head';
    const bodyClass = tableClass + '-body';
    const bodyLoadingClass = bodyClass + '-body';

    export abstract class RideStylerShowcaseTableModal<RowType> extends RideStylerShowcaseModal {
        protected readonly options:Options<RowType>;
        protected readonly columns:Column<RowType>[];

        protected tbody:HTMLTableSectionElement;

        constructor(showcaseInstance:RideStylerShowcaseInstance, options:Options<RowType>) {
            options = ObjectHelper.assign({

            }, options) 

            super(showcaseInstance, options);

            this.component.classList.add(modalClass);

            this.options = options;
            this.columns = options.columns;

            if (options.title) {
                HTMLHelper.createElement('h1', {
                    text: options.title,
                    appendTo: this.component
                });
            }

            this.buildTable();

            if (options.rows) this.appendRows(options.rows);
            else if (options.startLoading) this.setLoading(true);
        }

        protected buildTable() {
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
                let generatedCell = (cell as RideStylerShowcaseTableModal.CellGenerator<RowType>)(row, column);

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
            let rowsFragment = document.createDocumentFragment();

            for (let row of rows) {
                rowsFragment.appendChild(this.generateRow(row));
            }

            this.tbody.appendChild(rowsFragment);
        }

        protected setLoading(loading:boolean) {
            this.tbody.classList.toggle(bodyLoadingClass, loading);
        }
    }

    export namespace RideStylerShowcaseTableModal {
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

        export interface Options<RowType> extends RideStylerShowcaseModal.Options {
            /** 
             * A title for the modal
             */
            title?: string;

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