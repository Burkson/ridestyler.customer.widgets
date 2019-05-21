<template>
    <div>
        <table :class="{'table-hover': clickRowsToSelect}">
            <thead>
                <tr>
                    <th scope="col" v-if="selectable" style="width: 1%">
                        <input type="checkbox"
                            v-if="!singleSelect"
                            v-bind:checked.prop="selectedRows.length > 0"
                            v-bind:indeterminate.prop="selectedRows.length > 0 && selectedRows.length < computedData.length"
                            v-on:change="setAllRowsSelected($event.currentTarget.checked)">
                    </th>
                    <th scope="col" v-for="column in columns" :key="column.name" @click="onHeaderClick($event, column)">
                        {{ column.name }}

                        <template v-if="!!getSortStatus(column)">
                            <icon icon="sort-down" v-if="getSortStatus(column).descending" />
                            <icon icon="sort-up" v-else />
                        </template>

                        <slot :name="'header:' + getColumnHeaderKey(column)">
                        </slot>
                    </th>
                </tr>
            </thead>
            <tbody>
                
                <tr v-if="loading">
                    <td :colspan="numberOfColumns">
                        <slot name="loading">Loading...</slot>
                    </td>
                </tr>

                <tr v-else-if="message">
                    <td :colspan="numberOfColumns">
                        <slot name="message" :message="message">{{message}}</slot>
                    </td>
                </tr>

                <tr v-else-if="computedData.length === 0">
                    <td :colspan="numberOfColumns">
                        <slot name="no-results">No Results</slot>
                    </td>
                </tr>



                <tr v-else v-for="row in computedData" :key="row.id" :class="getRowClass(row)" @click="onRowClick($event, row)">
                    <td v-if="selectable">
                        <input :name="id + '-selection'" :value="row.id" :type="singleSelect ? 'radio' : 'checkbox'" :checked.prop="isRowSelected(row)" @change="setRowSelected(row, $event.currentTarget.checked, $event.shiftKey)">
                    </td>
                    <td v-for="column in columns" :key="column.name" :title="getCellTitle(row, column)">
                        <slot :name="'column:' + getColumnHeaderKey(column)" :row="row" :column="column">
                            {{ getCellText(row, column) }}
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>

let unique = 1;

export default {
    created() {
        this.id = "data-table-" + (unique++);
    },
    model: {
        prop: 'selection',
        event: 'selection'
    },
    data() {
        return {
            selectedRows: this.selection || [],
            currentSort: this.sort || []
        }
    },
    computed: {
        numberOfColumns() {
            return this.columns.length + (this.selectable ? 1 : 0)
        },
        computedData() {
            const computedData = this.data.concat();

            if (this.currentSort && this.currentSort.length) {
                computedData.sort((a, b) => {
                    for (let i = 0; i < this.currentSort.length; i++) {
                        const {
                            column: columnId,
                            descending
                        } = this.currentSort[i];

                        const column = this.columns.find(column => this.getColumnId(column) === columnId);

                        const aValue = this.getCellText(a, column);
                        const bValue = this.getCellText(b, column);
                        
                        if (aValue < bValue) return descending ? 1 : -1;
                        if (bValue < aValue) return descending ? -1 : 1;
                    }

                    return 0;
                });
            }

            return computedData;
        },
        numberOfRows() {
            return this.computedData.length;
        }
    },
    methods: {
        getRowClass(row) {
            const classes = [];

            if (this.isRowSelected(row)) classes.push('selected');
            if (this.clickRowsToSelect) classes.push('clickable');

            if (!this.rowClass) return classes;

            for (const className in this.rowClass) {
                if (!this.rowClass.hasOwnProperty(className)) continue;
                
                if (this.rowClass[className](row)) classes.push(className);
            }
            
            return classes;
        },
        getColumnHeaderKey(column) {
            return  column.name.replace(' ', '').toLowerCase();
        },
        isRowSelected(row) {
            return this.selectable && this.selectedRows.some(selectedRow => selectedRow.id === row.id);
        },
        setRowSelected(row, selected, shiftKey) {
            
            const _setSelected = (row, selected) => {
                if (!selected) {
                    const selectedRowIndex = this.selectedRows.findIndex(r => r.id === row.id);

                    if (selectedRowIndex >= 0) this.selectedRows.splice(selectedRowIndex, 1);
                } else {
                    if (this.singleSelect) this.selectedRows = [row];
                    else this.selectedRows.push(row)
                }
            };

            const index = this.computedData.findIndex(r => r.id === row.id);

            if (!this.singleSelect && shiftKey && this.lastSelection) {
                const from = Math.min(index, this.lastSelection.index);
                const to   = Math.max(index, this.lastSelection.index);

                this.computedData.slice(from, to + 1).forEach(row => _setSelected(row, selected));
            } else {
                _setSelected(row, selected);
            }

            this.lastSelection = {
                index,
                selected
            };

            // Emit an event different from selection so that we can differentiate between user selections and other selections
            this.$emit('user-selection', this.selectedRows);
        },

        getCellText(row, column) {
            if (typeof column.format === 'function') return column.format(row);
            
            if (Array.isArray(column.field)) {
                const parts = [];

                for (let i = 0; i < column.field.length; i++) {
                    const field = column.field[i];
                    
                    if (field in row === false) continue;

                    parts.push(row[field]);
                }

                return parts.join(column.separator || ' ');
            }
            
            if (column.field in row) return row[column.field];

            return '';
        },

        getCellTitle(row, column) {
            if (typeof column.tooltip === 'function') return column.tooltip(row);
            
            return '';
        },

        selectAll() {
            this.selectedRows = this.data.concat()
        },
        clearSelection() {
            this.selectedRows = [];
        },

        getColumnId(column) {
            if ('id' in column) return column.id;
            if (typeof column.field === 'string') return column.field;
            
            return column.id = 'column-' + unique++;
        },
        getSortStatus(column) {
            return this.currentSort.find(sort => sort.column === this.getColumnId(column));
        },

        onHeaderClick(e, column) {
            var columnId = this.getColumnId(column);
            var currentSort = this.currentSort.find(s => s.column === columnId);

            if (!currentSort) {
                currentSort = {
                    column: columnId,
                    descending: false
                };

                this.currentSort = [currentSort];
            } else {
                this.$set(currentSort, 'descending', !currentSort.descending);
            }
        },

        /**
         * @param {MouseEvent} e 
         */
        onRowClick(e, row) {
            if (this.clickRowsToSelect) {
                this.setRowSelected(row, !this.isRowSelected(row), e.shiftKey);
            }
        },

        setAllRowsSelected(selected) {
            if (selected) this.selectAll();
            else this.clearSelection();

            // Emit an event different from selection so that we can differentiate between user selections and other selections
            this.$emit('user-selection', this.selectedRows);
        }
    },
    props: {
        columns: {
            type: Array,
            required: true
        },
        data: {
            type: Array,
            required: true
        },
        sort: Array,
        selection: Array,
        selectable: Boolean,
        singleSelect: Boolean,
        clickRowsToSelect: Boolean,
        loading: Boolean,
        message: String,
        rowClass: Object
    },
    watch: {
        selectedRows() {
            this.$emit('selection', this.selectedRows);
        },
        numberOfRows() {
            this.$emit('update:numberOfRows', this.numberOfRows);
        },
        selection() {
            this.selectedRows = this.selection;
        }
    }
}
</script>