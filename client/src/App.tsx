import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import { AxiosResponse } from 'axios';
import Button from 'react-bootstrap/Button';

import { Dropdown } from './components/Dropdown';
import { getAllDegreePlans, getDegreePlanInfo } from './api';
import { DegreePlan, Course} from './types/degreeplan.types';
import { StandardListOption } from './types/dropdown.types';
import { PenaltyTable } from './components/PenaltyTable';
import { ProgressionChart } from './components/ProgressionChart';

function App() {
  const [allDegreePlanLoad, setAllDegreePlanLoad] = useState<DegreePlan[]>([]);
  const [selectedOp, setSelectedOp] = useState<StandardListOption>();
  const [selectedPlan, setSelectedPlan] = useState<Course[]>();


  useEffect(() => {
    getAllDegreePlans()
    .then((response : AxiosResponse) => {
      let responseData : DegreePlan[] = response.data;
      // console.log(responseData);
      setAllDegreePlanLoad(responseData);
      //TODO cache this result in localstorage
    }).catch((err) => {
      console.log(err)
    });
  }, []);

  function getDegreePlanCourses() {
    if (selectedOp) {
      getDegreePlanInfo(selectedOp.value)
      .then((result) => {
        let responseData : Course[] = result.data;
        // console.log(responseData);
        setSelectedPlan(responseData);
      }).catch((err) => {
        console.log(err)
      });
    }
  }
  
  return (
    <div className='App-container'>
      <div>
        <h1 className='App-header'>
          Degree Plan Explorer
        </h1>
        <span>
          Developed by Robert Au for the Center for Educational Effectiveness
        </span>
      </div>

      <div>
        {`You selected: ${selectedOp?.label || 'None'}`}
      </div>
      <Dropdown 
        ListItems={allDegreePlanLoad} 
        setSelectedItem={setSelectedOp}
      />
      <Button variant="primary" onClick={getDegreePlanCourses} className='loadDegreeBtn'>
        Load Degree Plan
      </Button>

      {/* Scatter Chart component */}
      {
        !selectedPlan
        ?
        <div>
          Pick a Degree Plan to see Degree Progression Tracking!
        </div>
        :
        <div>
          <ProgressionChart Courses={selectedPlan} Filters={null}/>
        </div>
      }

      {/* Raw Table Component */}
      {
        !selectedPlan 
        ? 
        <div>
          Pick a Degree Plan to see Degree Penalty Table!
        </div>
        :
        <PenaltyTable Courses={selectedPlan} Filters={null} />
      }
      
    </div>
  );
}

export default App;
