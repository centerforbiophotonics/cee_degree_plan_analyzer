export function ReadableCourseValue(label: string, value: any) {
  switch (label) {
    // round to 2 decimal places
    case "avg_c_gpao_pen":
    case "avg_s_gpao_pen":
      return Number(value).toFixed(3);

    // round to whole number
    case "total_students":
    case "term":
    case "most_recent_term":
    case "earliest_term_offered":
      return Number(value).toFixed(0);

    // grades list
    case "grades":
      return value.replace(/[\[\]'"]+/g, '')

    // other valid labels
    case "id":
    case "course_name":
    case "prefix":
    case "number":
    case "prerequisites":
    case "corequisites":
    case "strict_corequisites":
    case "credit_hours":
    case "institution":
    case "canonical_name":
      return value;




  
    default:
      return false;
  }
}