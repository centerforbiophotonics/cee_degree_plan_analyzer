// for tooltip details component
// turn y axis label into attribute that can access corresponding data
export function LabelToCourseAttr(label: string) {
  switch (label) {
    case "Credit Units":
      return "credit_hours";

    case "Sum of Cumulative GPAO Penalties":
    case "Average of Cumulative GPAO Penalties":
      return "avg_c_gpao_pen";

    case "Sum of Singular GPAO Penalties":
    case "Average of Singular GPAO Penalties":
      return "avg_s_gpao_pen";
    
    default:
      return "";
  }
}

// Translate label to label without average/sum transformation
// For cosmetic/reading purposes 
export function LabelToAttrLabel(label: string) {
  switch (label) {
    case "Credit Units":
      return "Credit Units";

    case "Sum of Cumulative GPAO Penalties":
    case "Average of Cumulative GPAO Penalties":
      return "Cumulative GPAO Penalty";

    case "Sum of Singular GPAO Penalties":
    case "Average of Singular GPAO Penalties":
      return "Singular GPAO Penalty";
    
    default:
      return "";
  }
}

// used for converting dropdown selection into course attribute for y axis && tooltip
export function LabelToSnakeCase(label: string) {
  switch (label) {
    case "Credit Units":
      return "credit_hours";

    case "Sum of Cumulative GPAO Penalties":
      return "sum_avg_c_gpao_pen";
    case "Sum of Singular GPAO Penalties":
      return "sum_avg_s_gpao_pen";

    case "Average of Cumulative GPAO Penalties":
      return "avg_avg_c_gpao_pen";
    case "Average of Singular GPAO Penalties":
      return "avg_avg_s_gpao_pen";
    
    default:
      return "";
  }
}


