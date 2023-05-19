export interface ScatterMetaData { 
  dataKey: string, 
  name: string, 
  payload: any, 
  type: any, 
  unit: string, 
  value: number
};

export interface TooltipCourseDetails<T extends string> {
  [className: string]: {
    [label in T]: number;
  };
}