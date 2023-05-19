interface CSVRow {
  [key: string] : number | string
}

export function SaveAsCSV (data: CSVRow[], fileName: string) {
  const csvRows = []
  const headers = Object.keys(data[0]);

  csvRows.push(headers.join(','));
     
  // Loop to get value of each objects key
  for (const row of data) {
      const values = headers.map(header => {
          const val = row[header]
          return `"${val}"`;
      });

      // To add, separator between each value
      csvRows.push(values.join(','));
  }

  const text = csvRows.join('\n');
  const blob = new Blob([text], { type: 'text/csv' });
  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}