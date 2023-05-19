import React, { useState } from 'react';
import Select from 'react-select';
import { StandardListOption}  from '../types/dropdown.types';

export const Dropdown = ({ListItems, setSelectedItem, additionalOnClick = () => {}} : { 
  ListItems: any[], 
  setSelectedItem: React.Dispatch<any>
  additionalOnClick?: Function
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // if(typeof ListItems[0] === 'string') console.log(ListItems);
  const ops = ListItems?.map((item, idx) => new StandardListOption(item, idx));
  
  function onChangeFn (e: any) {
    setSelectedItem(e);
    additionalOnClick();
  }
  return(
    <div>
      
      <Select
        aria-labelledby="aria-label"
        inputId="aria-example-input"
        name="aria-live-color"
        isSearchable
        onChange={onChangeFn}
        menuIsOpen={isMenuOpen}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        options={ops}
      />
    </div>
  )
}