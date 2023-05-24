// @ts-nocheck
import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Label, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from 'react-bootstrap/Button';

import { Course } from '../types/degreeplan.types';
import { Filter } from '../types/filter.types';
import { StandardPlotPoint } from '../types/plotChart.types';
import { Dropdown } from './Dropdown';
import CustomTooltip from './CustomTooltip';

import { COLORS } from '../styles/constants.js';
import styles from '../styles/ProgressionChart.module.css';

// The chart and axes
const ScatterChartComponent = ({currentChart, selectedYLabel, tooltipPayload}) => {

  if (!currentChart || !selectedYLabel) {
    return (
      <div>
        No data to display. Please select a Y-axis parameter
      </div>
    )
  }

  return (
    <div className={styles.chartContainer}>

      <div className={styles.chartUpperRegion}>

        <div className={styles.chart}>
          <ResponsiveContainer 
            width="97%" 
            aspect={2}
            minWidth={800}
            minHeight={300}
          >
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
              key={currentChart.length}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Term" interval={0} height={60}>
                <Label position='insideBottom' className={styles.xAxisLabel}>
                  Term
                </Label>
              </XAxis>
              <YAxis type="number" dataKey="y" name={selectedYLabel.label} width={70}>
                <Label angle={-90} position="insideLeft" className={styles.yAxisLabel}>
                  {selectedYLabel.label}
                </Label>
              </YAxis>
              <Tooltip 
                content={<CustomTooltip outsidePayload={tooltipPayload} />}
                cursor={{ stroke: 'salmon', strokeDasharray: '3 3', strokeWidth: 3}}
              />
              <Scatter name="A title" data={currentChart} fill={COLORS.gold} line={{stroke: COLORS.blue, strokeWidth: 2}} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  )
}

// Housing component for
// Dropdown for y axis parameter,
// Button to manipulate state,
// ScatterChartComponent
export const ProgressionChart = ({Courses, Filters} : { 
  Courses: Course[],
  Filters: Filter[] | null,
}) => {
  const timelineYGroupOptions = [
    "Credit Units", 
    "Sum of Cumulative GPAO Penalties", 
    "Sum of Singular GPAO Penalties",
    "Average of Cumulative GPAO Penalties",
    "Average of Singular GPAO Penalties",
  ];
  const [selectedYLabel, setSelectedYLabel] = useState(null);
  const [currentChart, setCurrentChart] = useState(null);
  const [chartVisible, setChartVisible] = useState(false);
  const [tooltipPayload, setTooltipPayload] = useState();

  // null coalescing operator: evaluate to left side if right side returns null/undefined
  const fullChartData = null ?? new StandardPlotPoint(Courses, selectedYLabel);

  function handleButtonClick() {
    // console.log(selectedYLabel)
    if (!selectedYLabel) return

    fullChartData.setYType(selectedYLabel.label);
    setCurrentChart(fullChartData.formatData());
    setTooltipPayload(fullChartData.formatTooltip());
    setChartVisible(true);
  }
  
  // console.log(fullChartData);
  // console.log(currentChart);
  
  return (
    <div className={styles.timelineContainer}>
      <h4 className={styles.timelineTitle}>
        Degree Progression Tracking
      </h4>
      <Dropdown 
        ListItems={timelineYGroupOptions} 
        setSelectedItem={setSelectedYLabel}
        additionalOnClick={() => setChartVisible(false)}
      />

      <Button variant="secondary" className={styles.loadChartButton} onClick={handleButtonClick}>Apply and Load Chart</Button>

      {
        chartVisible 
        ? 
        <ScatterChartComponent 
          currentChart={currentChart}
          selectedYLabel={selectedYLabel}
          tooltipPayload={tooltipPayload}
        />
        :
        <div>
          Detected changes in selection, press Apply and Load Chart
        </div>
      }
    </div>
  );
}