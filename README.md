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
## [Getting Started](#getting-started)
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
With access to the database, the server uses *express.js* to provide an api so that the client to request resources for degree plans and such.
`/api/degree_plans`
- fetches all records from the `degree_plan` table. Returns an array of elements of type [`Degree Plan`](#degree-plan).

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

Jump to the [Documentation](#documentation) section for more details.

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
## [Data Generation](#data-generation)
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

####`DegreePlan`
```typescript
export interface DegreePlan {
  id: number,
  name: string,
  overall_avg_c_gpao_pen: string,
  overall_avg_s_gpao_pen: string
};
```
####`Course`
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

```typescript
TODO: add more
```
---
## [Documentation](#documentation)
Here you may find some components or elements that are not being used. I am in need of some feedback on whether to remove these unused features.
### Components
#### CustomAxis

| Parameters | label : `string`, offset : `number[]`, angle : `number` (degrees), extraStyles : `object`|
|-|-|

Not used, intended for ProgressionChart. Replaced with library components `XAxis` and `YAxis` from `recharts`

#### CustomToolTip

| Parameters | active : `boolean`, payload : `ScatterMetaData[]`, label : `string`, outsidePayload : `ToolTipData`, ylabel : `string`|
|-|-|

Currently used in ProgressionChart, intended to show a tooltip on hovering a data point. Parameters are derived from the `recharts` component `ToolTip`. https://recharts.org/en-US/api/Tooltip 
- active: override to hide tooltip - Not used
- payload: The chart data 
- label: Label for the x-axis - Not used
- outsidePayload: The data relating to the Tooltip, particularly the course information individually
- ylabel: The selected y-axis option.






