import { Course } from "../types/degreeplan.types";
import { Filter } from "../types/filter.types";

// not used :c
export function filterCourse(courses : Course[], filter : Filter) {

  switch (filter.type) {
    // include substring type filters
    case "course_name":
      courses = courses.filter(c => c.course_name?.includes(filter.value))
      break;
    case "prefix":
      courses = courses.filter(c => c.prefix?.includes(filter.value))
      break;
    case "prerequisites":
      courses = courses.filter(c => c.prerequisites?.includes(filter.value))
      break;
    case "corequisites":
      courses = courses.filter(c => c.corequisites?.includes(filter.value))
      break;
    case "strict_corequisites":
      courses = courses.filter(c => c.strict_corequisites?.includes(filter.value))
      break;
    case "canonical_name":
      courses = courses.filter(c => c.canonical_name?.includes(filter.value))
      break;
  
    // strict match type filters
    case "number":
      courses = courses.filter(c => c.number === filter.value)
      break;
    case "credit_hours":
      courses = courses.filter(c => c.credit_hours === filter.value)
      break;
    case "institution":
      courses = courses.filter(c => c.institution === filter.value)
      break;
    case "term":
      courses = courses.filter(c => c.term === filter.value)
      break;
    case "most_recent_term":
      courses = courses.filter(c => c.most_recent_term === filter.value)
      break;
    case "earliest_term_offered":
      courses = courses.filter(c => c.earliest_term_offered === filter.value)
      break;

    // range type filters
    case "less_c_gpao":
    case "more_c_gpao":
    case "less_s_gpao":
    case "more_s_gpao":
      courses = courses.filter(c => compareNum(filter.type, filter.value, c))
      break;
    default:
      break;
  }

  return courses;
}

function compareNum(type : string, target : string, c : Course) {
  let parsedInput : number | "" | null;
  if (type.includes("c_gpao")) {
    parsedInput = c.avg_c_gpao_pen && parseFloat(c.avg_c_gpao_pen)
  } else {
    // s_gpao
    parsedInput = c.avg_s_gpao_pen && parseFloat(c.avg_s_gpao_pen)
  }
  const parsedTarget = parseFloat(target)

  if (type.includes("more")) {
    return parsedInput && !isNaN(parsedInput) &&
      !isNaN(parsedTarget) && parsedInput > parsedTarget
  } else {
    return parsedInput && !isNaN(parsedInput) &&
      !isNaN(parsedTarget) && parsedInput < parsedTarget
  }

}