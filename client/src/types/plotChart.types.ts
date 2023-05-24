import { Course } from "./degreeplan.types";
import { LabelToSnakeCase } from "../utils/labels";
// Puts y values into buckets -- for tooltip
/*
{
  1: {object, ...},
  2: {object, ...},
  3: {object, ...},
  ...
}
*/
// 
export interface YBuckets {
  [key: string] : Record<string, Course>
}
// Puts y values into buckets and sum the buckets -- for chart itself
// Example
// CustomYScale -> groupType is by term, valueType is credit_hours
// --> values are YPoints(term, credit_hours)
//
// YPoints -> `key` is term, `value` is credit_hours
/*
{
  1: 0.04385,
  2: 0.85896,
  3: 0.00234,
  ...
}
*/
// 
export interface YPointsSum {
  [key: string] : number
}

export class ToolTipData {
  courses: YBuckets = {};

  constructor(courses: Course[], groupType: string) {
    this.courses = (() => {
      const d = courses.reduce((acc, cur) => {
        // I would like to replace cur.term as cur[groupType] but i cant figure how
        const groupBy = parseInt(cur.term).toString();
        if (!acc[groupBy]) {
          acc[groupBy] = {};
        } 
        acc[groupBy][cur.course_name] = cur
        
        return acc;
      }, {} as YBuckets)
      return d;
    })()
  }

  get(Xlabel: string, Ylabel: string) {
    // console.log(Xlabel);
    // console.log(Ylabel);
    // console.log(this.courses);
    if(this.courses[Xlabel] === undefined) {
      return undefined;
    }
    const selectedTooltipData = Object.entries(this.courses[Xlabel]).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          [Ylabel]: value[Ylabel],
        }
      }),
      {}
    );

    return selectedTooltipData;
  }

  reset() {
    this.courses = {};
  }
}

// I would like the CustomYScale implementation to stay separate from the TooltipData
export class CustomYScale {
  // the values of the y-axis
  valueType: string;
  // Define how to group the original data for the y-axis
  groupType: string;
  values: YPointsSum;

  constructor(courses: Course[], groupType: string, valueType: string) {
    this.valueType = valueType;
    this.groupType = groupType;
    this.values = {} as YPointsSum
    let trimmedType: string = "";
    switch (valueType) {
      case 'credit_hours':
        this.values = courses.reduce((acc, cur) => {
          // I would like to replace cur.term as cur[groupType] but i cant figure how
          const term = parseInt(cur.term).toString();
          const units = cur[valueType];
          if (!acc[term]) {
            acc[term] = Number(units);
          } else {
            acc[term] = Number(acc[term]) + Number(units);
          }
          return acc;
        }, {} as YPointsSum)
        break;

      case 'sum_avg_c_gpao_pen':
      case 'sum_avg_s_gpao_pen':
        trimmedType = valueType.slice(4); // takes off prefix
        this.values = courses.reduce((acc, cur) => {
          const term = parseInt(cur.term).toString();
          const units = cur[trimmedType];
          if (!acc[term]) {
            acc[term] = Number(units);
          } else {
            acc[term] = Number(acc[term]) + Number(units);
          }
          return acc;
        }, {} as YPointsSum)
        break;

      case 'avg_avg_c_gpao_pen':
      case 'avg_avg_s_gpao_pen':
        trimmedType = valueType.slice(4);
        let totalTermCount: Record<string, number> = {}
        this.values = courses.reduce((acc, cur) => {
          const term = parseInt(cur.term).toString();
          const units = cur[trimmedType];
          if (!acc[term]) {
            acc[term] = Number(units);
            totalTermCount[term] = 1
          } else {
            acc[term] = Number(acc[term]) + Number(units);
            totalTermCount[term] += 1
          }
          return acc;
        }, {} as YPointsSum)

        for (const term in this.values) {
          this.values[term] = this.values[term] / totalTermCount[term]
        }

        break;

      default:
        break;
    }

  }

  contains(attr : string) : boolean {
    // console.log(typeof attr)
    // console.log(JSON.stringify(this.values))
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

    // Create a range of terms from minimum to maximum
    const maxTerm = courses.reduce((max: number, course: Course) => {
      return Math.max(max, Number(course.term));
    }, Number(courses[0].term));

    const minTerm = courses.reduce((min: number, course: Course) => {
      return Math.min(min, Number(course.term));
    }, Number(courses[0].term));
    for(let i = minTerm; i <= maxTerm; i++) {
      this.x_values.push(i);
    }

    this.y_values = new CustomYScale(courses, 'term', this.y_axis_label)
    this.tooltip_values = new ToolTipData(courses, 'term')

  }
  // // Change the label for X axis
  // setXType(attr: string) : void {
  //   if (attr in this.data) {
  //     // this.x_value = this.data[attr];
  //   } else {
  //     console.log(attr, 'not found');
  //     return
  //   }
  // }
  // Change the label for Y axis
  setYType(attr: string) : void {
    const new_y_axis_label = LabelToSnakeCase(attr);
    if (new_y_axis_label !== "") {
      this.y_values = new CustomYScale(this.data, 'term', new_y_axis_label);
    } else {
      console.log(new_y_axis_label, 'not found');
      return
    }
  }

  // Returns a list of objects in form
  // [ {x: 1, y: 2}, {x: 2, y: 4} ... ]
  formatData() : {x: number, y: number}[] {
    const formattedData = this.x_values.map((term_number) => {
      let s_term_number = String(term_number)
      return (
        {
          x: term_number,
          y: this.y_values.contains(s_term_number) ? this.y_values.get(s_term_number) : 0
        }
      )
    });
    return formattedData;
  }

  formatTooltip() {
    return this.tooltip_values;
  }
  
}