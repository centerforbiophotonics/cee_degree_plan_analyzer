import { isInstanceOfDegreePlan } from "./degreeplan.types";

export interface DropdownProps<T> {
  ListItems: T[]
};

// Standardize props for react-select
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
    } else {
      this.value = idx;
      this.label = 'Undefined';
    }

  }

}