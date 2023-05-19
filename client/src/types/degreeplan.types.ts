export interface DegreePlan {
  id: number,
  name: string,
  overall_avg_c_gpao_pen: string,
  overall_avg_s_gpao_pen: string
};

export function isInstanceOfDegreePlan(object: any): object is DegreePlan {
  if ('id' in object && 'name' in object) {
    return true
  }
  return false
}

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