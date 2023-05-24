import { ScatterMetaData, TooltipCourseDetails } from "../types/customTooltip.types";
import { ToolTipData } from "../types/plotChart.types";
import { LabelToCourseAttr, LabelToAttrLabel, LabelToSnakeCase } from "../utils/labels";
import { ReadableCourseValue } from "../utils/formatValues";
import styles from '../styles/Tooltip.module.css'

const tooltipStyle = {
  backgroundColor: 'black',
  border: '2px solid grey',
  padding: '5px',
  borderRadius: '5px',
  fontSize: '14px',
  color: 'white',
};

// `label` is probably used in bar charts
// `payload` is the data content of the point hovered, 
const CustomTooltip = ({ active, payload, outsidePayload} : {
  active: boolean,
  payload: ScatterMetaData[],
  outsidePayload: ToolTipData,
}) => {
  // console.log(yLabel)
  if (active && payload && payload.length) {
    const formatYLabel = LabelToSnakeCase(payload[1].name)
    // console.log(outsidePayload)
    console.log(outsidePayload.get((payload[0].value).toString(), formatYLabel));
    let tooltipCourseDetails: TooltipCourseDetails<typeof formatYLabel> | undefined = outsidePayload.get((payload[0].value).toString(), LabelToCourseAttr(payload[1].name));
    return (
      <div style={tooltipStyle}>
        <p className={styles.toolLabel}>{`${payload[0].name} : ${payload[0].value}`}</p>
        <p className={styles.toolLabel}>{`${payload[1].name} : ${payload[1].value}`}</p>
        <TooltipDetailsComponent details={tooltipCourseDetails} yLabel={payload[1].name} />
      </div>
    );
  }

  return (
    <></>
  );
};

function abbreviateCourseName (name: string, len: number) {
  const words = name.split(' ');
  const abbr = words.slice(0, len).join(' ');
  return abbr;
};

const TooltipDetailsComponent = ({ details, yLabel } : {
  details : TooltipCourseDetails<any> | undefined
  yLabel : string
}) => {
  return(
    <table className={styles.toolTable}>
      <thead>
        <tr>
          <th>Course Name</th>
          <th>{LabelToAttrLabel(yLabel)}</th>
        </tr>
      </thead>
      <tbody>
        {
          details 
          ?
          Object.entries(details).map(([courseName, value]) => {
            return (
              <tr key={courseName}>
                <td>{abbreviateCourseName(courseName, 2)}</td>
                <td>{ReadableCourseValue(LabelToCourseAttr(yLabel), value[LabelToCourseAttr(yLabel)]) || "N/A"}</td>
              </tr>
            )
          })
          :
          <tr>
            <td colSpan={2}>
              No courses applicable
            </td>
          </tr>
        }
      </tbody>
    </table>
  )

}

export default CustomTooltip;