import React, { useMemo } from 'react';
import { useTable, useSortBy, useBlockLayout, useResizeColumns, HeaderGroup, Row } from 'react-table';
import Table from 'react-bootstrap/Table';


import { Course } from '../types/degreeplan.types';
import { Filter } from '../types/filter.types';
import { ReadableCourseValue } from '../utils/formatValues';
import { SaveAsCSV } from '../utils/csv';
import styles from '../styles/PenaltyTable.module.css';

type Column = {
  id: string;
  Header: string;
  accessor: string;
  show?: boolean;
};

interface CustomHeaderGroup<T extends object> extends HeaderGroup<T> {
  show?: boolean;
}

export const PenaltyTable = ({Courses, Filters} : { 
  Courses: Course[], 
  Filters: Filter[] | null,
}) => {
  // const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // const ops = Courses?.map(item => new StandardListOption(item));
  // Courses is a List of Course items
  const data = useMemo(() => Courses as Course[], [Courses]);

  // Column Definition
  const columns: Column[] = React.useMemo(
    () => [
      {
        id: "id",
        Header: 'ID',
        accessor: 'id', // accessor is the "key" in the data
        show: true,
      },
      {
        id: "course_name",
        Header: 'Course Name',
        accessor: 'course_name',
        show: false,
      },
      {
        id: "prefix",
        Header: 'Prefix',
        accessor: 'prefix',
        show: true,
      },
      {
        id: "number",
        Header: 'Number',
        accessor: 'number',
        show: true,
      },
      {
        id: "prerequisites",
        Header: 'Prerequisites',
        accessor: 'prerequisites',
        show: true,
      },
      {
        id: "corequisites",
        Header: 'Corequisites',
        accessor: 'corequisites',
        show: true,
      },
      {
        id: "strict_corequisites",
        Header: 'Strict Corequisites',
        accessor: 'strict_corequisites',
        show: true,
      },
      {
        id: "credit_hours",
        Header: 'Credit Hours',
        accessor: 'credit_hours',
        show: false,
      },
      {
        id: "institution",
        Header: 'Institution',
        accessor: 'institution',
        show: true,
      },
      {
        id: "canonical_name",
        Header: 'Canoncial Name',
        accessor: 'canonical_name',
        show: true,
      },
      {
        id: "term",
        Header: 'Term',
        accessor: 'term',
        show: false,
      },
      {
        id: "avg_c_gpao_pen",
        Header: 'Average Cumulative GPA Other Penalty',
        accessor: 'avg_c_gpao_pen',
        show: false,
      },
      {
        id: "avg_s_gpao_pen",
        Header: 'Average Singular GPA Other Penalty',
        accessor: 'avg_s_gpao_pen',
        show: false,
      },
      {
        id: "total_students",
        Header: 'Total Students',
        accessor: 'total_students',
        show: false,
      },
      {
        id: "most_recent_term",
        Header: 'Most Recent Term',
        accessor: 'most_recent_term',
        show: false,
      },
      {
        id: "earliest_term_offered",
        Header: 'Earliest Term Offered',
        accessor: 'earliest_term_offered',
        show: false,
      },
      {
        id: "grades",
        Header: 'Grade Range',
        accessor: 'grades',
        show: true,
      },
    ],
    []
  )
  
  // tanstack react table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setHiddenColumns,
    allColumns,
  } = useTable(
    { 
      columns,
      data,
    }, 
    useSortBy,
    useBlockLayout,
    useResizeColumns
  );

  // Hide some columns by default
  React.useEffect(() => {
    setHiddenColumns(columns.map((col, _) => (col.show ? col.id : "")));
  }, [columns, setHiddenColumns]);

  function download() {
    const exportData: { [key: string]: any }[] = rows.map(row =>
      row.cells.reduce((acc, cur) => {
        acc[cur.column.id] = cur.value;
        return acc;
      }, {} as {[key: string]: any})
    );

    SaveAsCSV(exportData, "GPAOther_Penalties.csv")
  }

  return (
    <div>
      <div className={styles.checkboxContainer}>
        <h5 className={styles.checkboxLabel}>
          Show/Hide Headers for Degree Plan Penalty Table
        </h5>
        <div className={styles.checkboxGroup}>
          {allColumns.map(column => (
            <div key={column.id}>
              <label>
                <input type="checkbox" {...column.getToggleHiddenProps()}/>{' '}
                {column.id}
              </label>
            </div>
          ))}
          <div>
            <button onClick={download}>Export Table</button>
          </div>
        </div>

      </div>

      <Table {...getTableProps()} striped bordered hover size="sm" className={styles.table}>
        <thead>
          {// Loop over the header rows
          headerGroups.map((headerGroup: CustomHeaderGroup<Course>) => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map(column => (
                // Apply the header cell props
                <th 
                  {...column.getHeaderProps()}
                  onClick={() => column.toggleSortBy(!column.isSortedDesc)}
                >
                  {column.render('Header')}
                  <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {// Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row)
            return (
              // Apply the row props
              <tr {...row.getRowProps()}>
                {// Loop over the rows cells
                row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>
                      {ReadableCourseValue(cell.column.id, cell.value)}
                    </td>
                  );
                  
                })}
              </tr>
            )
          })}
        </tbody>
      </Table>
      
    </div>
  )
}