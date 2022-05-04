import SSF from "ssf";

export const formatValue = (dataItemMeasure, valueFormat) => 
(valueFormat === undefined || valueFormat === '')
  ? LookerCharts.Utils.textForCell(dataItemMeasure) 
  : SSF.format(valueFormat, dataItemMeasure.value);

export const handleClick = (links, event) => {
    links !== undefined 
      ? LookerCharts.Utils.openDrillMenu({
         links: links,
         event: event
      })
      : LookerCharts.Utils.openDrillMenu({
         links: [],
         event: event
      });
  }

