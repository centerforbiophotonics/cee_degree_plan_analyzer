import React from 'react'

// not used :c
// offset: [horizontal, vertical]
// angle: deg

const CustomAxis = ({ label, offset = [0, 0], angle = 0, extraStyles= {}} : {
  label: string,
  offset: number[],
  angle: number,
  extraStyles: any
}) => {
  const style: React.CSSProperties = {
    height: '20px',
    fontWeight: 'bold',
    transform: `rotate(${angle}deg) translate(${offset[0]}px, ${offset[1]}px)`,
    transformOrigin: 'center',
    textAlign: 'center',
    ...extraStyles
  };
  console.log(extraStyles);
  return (
    <div style={style}>{label}</div>
  )
}

export default CustomAxis