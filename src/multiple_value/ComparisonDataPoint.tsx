import React from "react";
import styled from 'styled-components'
// @ts-ignore
import {lighten} from '../common'
import { AppearanceSettings, ComparisonValue } from "./types";

let DataPointComparisonGroup = styled.div`
  flex: 1;
  width: 100%;

  margin: 10px 0;
  
  font-size: 0.9em;
  font-weight: 400;
  color: #a5a6a1;

  a.drillable-link {
    color: #a5a6a1;
    text-decoration: none;
  }
`

type ArrowProps = {
  positive: boolean;
}

const UpArrow = styled.div<ArrowProps>`
  display: inline-block;
  width: 0; 
  height: 0; 
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid ${({ positive }) => positive ? 'red' : 'green' };
  margin-right: 5px;
`

const DownArrow = styled.div<ArrowProps>`
  display: inline-block;  
  width: 0; 
  height: 0; 
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 10px solid ${({ positive }) => positive ? 'green' : 'red' };
  margin-right: 5px;
`
const ComparisonPercentageChange = styled.div`
  display: inline-block;
  padding-right: 5px;
  :hover {
    text-decoration: underline;
  }
`
const ComparisonSimpleValue = styled.div`
  font-weight: 400;
  display: inline-block;
  padding-right: 5px;
  :hover {
    text-decoration: underline;
  }
`

type ComparisonProgressBarProps = {
  background: string,
  pct?: number,
}

const ComparisonProgressBar = styled.div<ComparisonProgressBarProps>`
  position: relative;
  background-color: ${({background}) => background ? lighten(background, 60) : lighten("#282828", 80)};
  height: 40px;
  text-align: center;
  border-radius: 4px;
  overflow: hidden;
`

const ComparisonProgressBarFilled = styled.div<ComparisonProgressBarProps>`
  background-color: ${({background}) => background ? lighten(background, 45) : lighten("#282828", 60)};
  width: ${({pct}) => pct}%;
  height: 40px;
`

const ComparisonProgressBarLabel = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 40px;
  text-align: center;
  line-height: 40px;  
  color: #000000;

  a.drillable-link {
    color: #000000;
  }
`;

export const DataPointComparison: React.FC<{
  config: AppearanceSettings,
  dataPoint: ComparisonValue,
  handleClick: (i: any, j: any) => void,
}> = ({ config, dataPoint, handleClick }) => {
  let progressPercent = Math.round((dataPoint.value / dataPoint.comparison.value) * 100)
  let changePercent = progressPercent - 100;

  return (
    <DataPointComparisonGroup>

    {config.value_labels === 'value' && (
      <>
        <ComparisonSimpleValue onClick={() => { handleClick(dataPoint.comparison.link, event) }}>
          {dataPoint.comparison.formattedValue}
        </ComparisonSimpleValue>
        {config.comparison_show_label && dataPoint.comparison.label}
      </>
    )}

    {config.value_labels === 'change' && (
      <>
        <ComparisonPercentageChange data-value={changePercent} onClick={() => { handleClick(dataPoint.comparison.link, event) }}>
          {changePercent >= 0 
            ? <UpArrow positive={config.pos_is_bad}/> 
            : <DownArrow positive={config.pos_is_bad}/>
          }
          {changePercent}%
        </ComparisonPercentageChange>
        {config.comparison_show_label && dataPoint.comparison.label}
      </>
    )}
    
    {(config.value_labels === 'progress' || config.value_labels === 'progress_percentage') && (
      <ComparisonProgressBar background={'#0000FF'}>
        <ComparisonProgressBarFilled
          background={'#0000FF'}
          pct={Math.min(progressPercent || 0, 100)}
        />
        <ComparisonProgressBarLabel>
          <div onClick={() => { handleClick(dataPoint.comparison.link, event) }}>
            {config.value_labels === 'progress_percentage' && `${progressPercent}% of ${dataPoint.comparison.formattedValue} `}
            {config.comparison_show_label && dataPoint.comparison.label}
          </div>
        </ComparisonProgressBarLabel>
      </ComparisonProgressBar>
    )}
    </DataPointComparisonGroup>
  )
}
