# Degree Plan Explorer for KYS
## A visualization tool that estimates the difficulty of a generated degree plan.

This project is built using React, Express, Node, SQL (and Typescript). The tool currently has two components:
- Progression Chart: A Plot chart that tracks the terms over time on the X-axis. The Y-axis can be changed to a different variable to measure along the terms.
- Penalty Table: A table that describes the raw data of the selected degree plan. There is a checkbox menu to hide/display specific columns of data. 

## Vocabulary
<dl>
  <dt>GPA Other (GPAO)</dt>
  <dd>Represents the grade point average (GPA) of a specific course term, excluding a particular course.</dd>
  <dd>GPAO Singular: Measures the current term</dd>
  <dd>GPAO Cumulative: Measures all previous terms up to and including the current term</dd>
</dl>

---
## Getting Started
### SQL Database
The database needs to be initialized if not already. If it needs to be initialized, load the input folder `degree_plans_with_grade_penalty` with the Degree Plan CSV files. To run, go in `~/DegreePlanExplorer/server/db` and run the Python DB initialization script `degree_penalties_to_sql_db.py`. To learn more about how the process in which the grade penalty files were created, jump to [Data Generation](#data-generation)

When `server.ts` is run, it connects to this generated SQL database `DegreePlanPenalties.db`.
Here are the tables:

| Name: course | -- |
| ----------- | ----------- |
| id | integer |
| course_name | string |
| prefix | string |
| number | string |
| prerequisites | string |
| corequisites | string |
| strict_corequisites | string |
| credit_hours | string |
| institution | string |
| canonical_name | string |
| term | string |
| avg_c_gpao_pen | string |
| avg_s_gpao_pen | string |
| total_students | string |
| most_recent_term | string |
| earliest_term_offered | string |
| grades | string |
---
| Name: degree_course_association | -- |
| ----------- | ----------- |
| degree_plan_id | integer |
| course_id | integer |
---
| Name: degree_plan | -- |
| ----------- | ----------- |
| id | integer |
| overall_avg_c_gpao_pen | string |
| overall_avg_s_gpao_pen | string |

The `course` table describe a single course per entry. The `degree_course_association` table describes a many-to-one relationship between the ids in the `course` table and the unique `degree_plan_id` for a single degree plan. The script collects the GPA Other (GPAO) penalties of all courses in a degree plan and computes the overall averages at the end, appended in the `degree_plan` table.

---
### Backend/Server
With access to the database, the server uses *express.js* to provide an api so that the client can request resources for degree plans and such.

`/api/degree_plans`
- fetches all records from the `degree_plan` table. Returns an array of elements of type [`Degree Plan`](#degreeplan).

`/api/degree_plan_info`
- given 1 degree plan `id` from request query string params, collect all courses whose ids are linked to the degree plan `id` through the `degree_course_association` table. In other words, it fetches all courses related to this degree plan. Returns an array of elements of type [`Course`](#course).
---
### Frontend/Client
The main file structure for the frontend is highlighted here:
```
├── src
│   ├── components
│   │   └── ...
│   ├── styles
│   │   └── ...
│   ├── types
│   │   └── ...
│   ├── utils
│   │   └── ...
│   ├── App.tsx
│   ├── api.ts
│   └── ...
└── ...
```
`App.tsx` is the main page that renders all the components. The `components` hold standalone elements that represent a single item such as graph or table. The components will take in parameters that follow object types defined in the `types` folder. The `styles` folder contains styles for the components. The `utils` folder contains helper functions that are not intended to be tied to one specific component. The `api.ts` is where the axios requests are defined.

Jump to the [Documentation](#documentation) section for more details about components, api, and the app.
Jump to the [Data Types](#data-types) section for more details about types.

---
### Actually getting started for real this time
In the client directory
```
npm install
npm start
```
In the server directory
```
npm install
npm start
```
---
## Data Generation
The KYS project should provide the means to create GPA Other calculations, stored in the `GpaOther` table (i.e. these ruby scripts do not work here in this project, they are supposed to be run in KYS). 

The `DegreePlanGradePenaltyCalc` module in `degree_plan_grade_penalty_calc.rb` reads in a folder of degree plans `degree_plans_from_median_term_taken` (generated CSV files that I got from our org's Box), and computes the GPA Other Penalty. It then spits out the same CSV files annotated with this GPA Other Penalty in the `degree_plans_with_grade_penalty`.

The module `CourseGradePenalty` module in `course_grade_penalty.rb` is what provides the calculation function to compute these metrics. Currently the calculation function is a simple point difference between the observed course's grade and the GPA Other (cumulative or singular), which is why there are two values: GPA Other Penalty singular and GPA Other Penalty cumulative. 

To modify this calculation function, edit the module's function `calculate_ratings`.
```ruby
# some code
# consider putting weights?
...
(gpao.course_grade - gpao.gpao_cumulative)
...
(gpao.course_grade - gpao.gpao_singular)
...
##
```
---
## Data Types
Typescript allows us to implement object-oriented concepts, which will be leveraged using types. These types can be modified in `~/client/src/types`. 

### `DegreePlan`
```typescript
export interface DegreePlan {
  id: number,
  name: string,
  overall_avg_c_gpao_pen: string,
  overall_avg_s_gpao_pen: string
};
```
### `Course`
```typescript

export interface Course {
  // index signature for accessing props via variable
  [key: string]: string | number;

  id: number,
  course_name: string,
  prefix: string,
  number: string,
  prerequisites: string,
  corequisites: string,
  strict_corequisites: string,
  credit_hours: string,
  institution: string,
  canonical_name: string,
  term: string,
  avg_c_gpao_pen: string,
  avg_s_gpao_pen: string,
  total_students: string,
  most_recent_term: string,
  earliest_term_offered: string,
  grades: string
};
```
### `ScatterMetaData`
```typescript
export interface ScatterMetaData { 
  dataKey: string, 
  name: string, 
  payload: any, 
  type: any, 
  unit: string, 
  value: number
};

```
### `YBuckets`
```typescript
// A hashmap where keys are string, and value is a nested hashmap
// with key being a string and the value being the object Course
// *see ToolTipData constructor*
export interface YBuckets {
  [key: string] : Record<string, Course>
}
```
### `ToolTipData`
```typescript
export interface YBuckets {
  [key: string] : Record<string, Course>
}

export class ToolTipData {
  courses: YBuckets = {};

  constructor(courses: Course[], groupType: string) {
    // courses is a hashmap where the keys are Term Number and values are 
    // hashes with the keys being course name and value being the Course object
    // ex)
    /*
      {
        "courses": {
          "3": {
            "ANT 002 Cultural Anthropology": {
              "id": 2,
              "course_name": "ANT 002 Cultural Anthropology",
              "prefix": "ANT",
              "number": "002",
              "prerequisites": "",
              "corequisites": "1.0",
              "strict_corequisites": "",
              "credit_hours": "5.0",
              "institution": "",
              "canonical_name": "",
              "term": "3.0",
              "avg_c_gpao_pen": "0.376836080586081",
              "avg_s_gpao_pen": "0.376698717948718",
              "total_students": "2184.0",
              "most_recent_term": "202201.0",
              "earliest_term_offered": "200010.0",
              "grades": "[\"A\", \"A-\", \"A+\", \"B\", \"B-\", \"B+\", \"C\", \"C-\", \"C+\", \"D\", \"D-\", \"D+\", \"F\", \"I\", \"NG\", \"NP*\", \"P*\", \"Y\"]"
            },
            "ECN 001B Princ Of Macroecon": {
              ...
            },
            ...
          },
          "4": {
            "HIS 010C 19th-20th Century World": {
              ...
            },
            ...
          },
          "6": {
            "HIS 193B Middle East from 1914": {
              ...
            }
          },
          
          ...
        }
      }
    */ 
  }

  get(Xlabel: string, Ylabel: string) {
    // Returns a hashmap of objects that describe the invidiual items at a 
    // particular x-value and y-label
    // ex) At Term 9 and label Credit Units for some degree plan
    /* 
      {
        "SOC 118 Political Sociology": {
          "credit_hours": "4.0"
        },
        "ANT 123AN Resist Rebel & Pop Mvmnt": {
          "credit_hours": "4.0"
        },
        "IRE 104 International Migration": {
          "credit_hours": "4.0"
        }
      }
    */
  }

  reset() {
    this.courses = {};
  }
}
```

### `StandardListOption`
```typescript
export class StandardListOption {
  value: number;
  label: string;
  overall_avg_c_gpao_pen?: string;
  overall_avg_s_gpao_pen?: string;

  public constructor(item: any, idx: number) {
    if (typeof item === 'object' && isInstanceOfDegreePlan(item)) {
      this.value = item.id;
      this.label = item.name;
      this.overall_avg_c_gpao_pen = item.overall_avg_c_gpao_pen;
      this.overall_avg_s_gpao_pen = item.overall_avg_s_gpao_pen;
    }
    else if (typeof item === 'string' || item instanceof String) {
      this.value = idx;
      this.label = String(item);
    /* 
    
    If you want to pass in your own type into Dropdown, you
    need to implement the type to be converted to StandardListOption here
    Requirements: value, label

    */
    } else {
      this.value = idx;
      this.label = 'Undefined';
    }

  }

}
```
### `Filter`
- Not used

### `StandardPlotPoint`
```typescript
export class StandardPlotPoint {
  data: Course[];
  x_axis_label : string;
  y_axis_label: string;
  x_values: number[];
  y_values: CustomYScale;
  tooltip_values: ToolTipData;

  constructor(courses: Course[], ylabel: string) {
    this.data = courses;
    this.x_axis_label = "term"
    this.y_axis_label = LabelToSnakeCase(ylabel)
    this.x_values = [] as number[];

    // Generates x-values (Terms)
    // Generates y-values (using CustomYScale)
    // Generates Tooltip object
  }

  // Change the label for Y axis
  setYType(attr: string) : void {
    // Creates a new CustomYScale object with the selected attribute
    // Then constructs a hash containing objects storing the 
    // binned values of the data
    // Then overwrites this.y_values
  }

  formatData() : {x: number, y: number}[] {
    // Returns a list of coordinate objects 
    // This is the data format for the Scatter chart from recharts
    /*
      [{x: 1, y: 2}, ...]
    */
  }

  formatTooltip() {
    // Returns a TooltipData object that groups the raw 
    // course data based on the y label
  }
  
}

```

### `CustomYScale`
```typescript
// to store as buckets
export interface YPointsSum {
  [key: string] : number
}

export class CustomYScale {
  // the value of the y-axis
  valueType: string;
  // Define how to group the original data for the y-axis
  groupType: string;
  values: YPointsSum;

  constructor(courses: Course[], groupType: string, valueType: string) {
    this.valueType = valueType;
    this.groupType = groupType;
    this.values = {} as YPointsSum // buckets
    let trimmedType: string = "";
    // Based on y-label valueType
    /*
      credit_hours, 
      sum_avg_c_gpao_pen, 
      sum_avg_s_gpao_pen
      ==> bucket number is the sum of each category, i.e. a normal bucket 
    */
    /*
      avg_avg_c_gpao_pen, avg_avg_s_gpao_pen
      ==> bucket number is the average value of each category 
    */

  }

  contains(attr : string) : boolean {
    if (attr in this.values) {
      return true
    }
    return false
  }

  get(xlabel: string) : number {
    return this.values[xlabel]
  }

  getYRange() : [l:number , r:number] {
    switch (this.valueType) {
      // maybe change?
      case "avg_avg_c_gpao_pen":
      case "avg_avg_s_gpao_pen":
      case "sum_avg_c_gpao_pen":
      case "sum_avg_s_gpao_pen":
        return [-4, 4];
    
      default:
        const y_list : Array<number> = Object.values(this.values)
        return [0, Math.max(...y_list)];
    }
  }
}
```
```typescript
TODO: add more
```
---
## Documentation
Here you may find some components or elements that are not being used. I am in need of some feedback on whether to remove these unused features.

#### CustomToolTip

| Parameters | active : `boolean`, payload : [`ScatterMetaData[]`](#scattermetadata), outsidePayload : [`ToolTipData`](#tooltipdata)|
|-|-|

Currently used in ProgressionChart, intended to show a tooltip on hovering a data point. Parameters are derived from the `recharts` component `ToolTip`. https://recharts.org/en-US/api/Tooltip 
- active: override to hide tooltip - Not used currently in ProgressionChart.
- payload: The chart data. It follows the data format of an array of [`ScatterMetaData`](#scattermetadata).
- outsidePayload: The data relating to the Tooltip, particularly the course information individually. It is type [`ToolTipData`](#tooltipdata).

#### Dropdown

| Parameters | ListItems : `any[]`, setSelectedItem : `React setState function`, additionalOnClick : `function`|
|-|-|

Used for the Degree Plan selection in `App.tsx` and in ProgressionChart to change the y-label. The ListItems prop will be converted to type [`StandardListOption`](#standardlistoption) to match the data format for *Select* from *react-select*.

- ListItems: takes in a list of any type, provided that there is an implementation for the conversion of that type into [`StandardListOption`](#standardlistoption) in the constructor.
- setSelectedItem: pass in a setState function from a parent component, so that the dropdown can update the state variable in the parent component.
- additionalOnClick: you can pass in another setState function from a parent component. Currently this is used to update a toggle state in ProgressionChart.

#### FilterForm

| Parameters | ListItems: `Filter[]` or `null`, setSelectedItem : `React setState function`|
|-|-|

Currently not used. Was meant to be a dropdown that would filter out the columns of penalty table. Maybe remove later.

#### PenaltyTable

| Parameters | Courses: [`Course[]`](#course) |
|-|-|

Passes Course data into *useTable* from *react-table* and rendered using *Table* from *react-bootstrap*. Clicking the headers of the columns will toggle ascending/descending sort. 

Includes a filter form above the table, a checked option indicates the column is visible on the table. The component unchecks some of the columns by default in the useEffect based on column definition.

Includes a download button that takes the current state of the fitlered table and turns it into a csv.

Notes: 
Adding a new column would require updating the `columns` in the `PenaltyTable.tsx` and `ReadableCourseValue` in `utils/formatValues.ts`
- ReadableCourseValue is a utility function that formats the cell values depending on the column type. Modify the switch function in its definition to add a new column name or to change a column's exisiting format.

The download function currently exports the csv under the static name "GPAOther_Penalties.csv"

#### ProgressionChart

| Parameters | Courses: [`Course[]`](#course) |
|-|-|

Renders a list of Courses from a selected Degreeplan as a scatter plot. There are 2 components: 
- ScatterChartComponent: contains the plot and axes
- ProgressionChart: contains a dropdown that controls the y-label, and houses ScatterChartComponent

Courses in converted to type [`StandardPlotPoint`](#standardplotpoint) object in order to provide chart functionality
- The selectedYLabel state is passed into the StandardPlotPoint setYType to set the category for the data's y axis.
- StandardPlotPoint formatData is called after setting the Y type in order to re-sort and bin the data based on the selected y label.
- StandardPlotPoint formatTooltip is called after setting Y type for similar reasons, to search the raw values for the selected y label.

React States:
- selectedYLabel: Holds the string value of y-axis to be, will be set in the StandardPlotPoint object when 'Apply Changes' is clicked
- currentChart: Derived from StandardPlotPoint, a list of coordinates [{x: 1, y:2}, ...] that is ultimately passed into *ScatterChart* from *recharts*
- chartVisible: Used to toggle visibility of the chart, used when the dropdown selects a y-label.
- tooltipPayload: Derived from StandardPlotPoint, is type [`ToolTipData`](#tooltipdata) in order to get the list of related courses at any given plot point.

