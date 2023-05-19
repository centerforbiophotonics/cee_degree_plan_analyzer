import React, { useState } from 'react';
import { Filter } from '../types/filter.types';
import Button from 'react-bootstrap/Button';

export const FilterForm = ({ListItems, setSelectedItem} : { 
  ListItems: Filter[] | null, 
  setSelectedItem: React.Dispatch<any>
}) => {
  const [formValues, setFormValues] = useState(ListItems);

  function applyFilters() {
    return
  }

  return(
    <div>
      <Button variant="primary" onClick={applyFilters}>Apply</Button>
    </div>
  )
}