

function calculateWeekTotal(startDate, endDate, dataArray) {
  return dataArray.filter(td => {
    const tdDate = new Date(td.date);
    return tdDate >= startDate && tdDate <= endDate;
  }).reduce((sum, td) => sum + (td.periods || 0), 0);
}

export { calculateWeekTotal };