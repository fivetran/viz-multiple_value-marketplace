import React from 'react';
import styled, { StyledComponentProps } from 'styled-components';
import { DataPointComparison } from './ComparisonDataPoint';
import { AppearanceSettings, ComparisonValue, SingleValue } from './types';
import { handleClick } from './looker_utils.js';

type LayoutProps = StyledComponentProps<any, any, any, any> & {
  layout?: string,
  titlePlacement?: string,
}

const DEFAULT_GROUPING_LAYOUT = 'horizontal';

const DataPointsWrapper = styled.div`
  font-family: "Google Sans", "Roboto", "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: ${({ layout }: LayoutProps) => layout === 'horizontal' ? 'row' : 'column'};
  flex-wrap: wrap;
  align-items: center;
  margin: 10px;
  height: 100%;
`

const DataPoint = styled.div`
  margin: 20px 5px;
  text-align: center;
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const Divider = styled.div`
  background-color: #282828;
  height: 35vh;
  width: 1px;
`

const DataPointValueContainer = styled.div`
  display: flex;
  flex-shrink: ${({ layout }: LayoutProps) => layout === 'horizontal' ? 'auto' : 0 };
  flex-direction: ${({ titlePlacement }: LayoutProps) => titlePlacement === 'above' ? 'column' : 'column-reverse'};
  flex: 1;
`

const DataPointTitle = styled.div`
  font-weight: 400;
  color: ${props => props.color};
  margin: 5px 0;
`

const DataPointValue = styled.div`
  font-size: 3em;
  font-weight: 400;
  color: ${props => props.color};

  a.drillable-link {
    color: ${props => props.color};
    text-decoration: none;
  }
  :hover {
    text-decoration: underline;
  }
`

type Props = {
  config: AppearanceSettings,
  data: (ComparisonValue | SingleValue)[]
}

type State = {
  groupingLayout: string,
  fontSize: number,
}

class MultipleSingleValues extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      groupingLayout: DEFAULT_GROUPING_LAYOUT,
      fontSize: this.calculateFontSize(DEFAULT_GROUPING_LAYOUT),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalculateSizing);
  }

  componentDidUpdate() {
    this.recalculateSizing();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateSizing);
  }

  getLayout = () => {
    let CONFIG = this.props.config
    if(
      CONFIG.orientation === 'auto' ||
      typeof CONFIG['orientation'] === 'undefined'
      ) { 
        return this.state.groupingLayout 
      } 
    return CONFIG['orientation']
  }

  getWindowSize = () => {
    return Math.max(window.innerWidth, window.innerHeight);
  }

  calculateFontSize = (groupingLayout: string) => {
    const multiplier = groupingLayout === 'horizontal' ? 0.01 : 0.02;
    return Math.round(this.getWindowSize() * multiplier);
  }

  recalculateSizing = () => {
    const EM = 16;
    const groupingLayout = window.innerWidth >= 768 ? 'horizontal' : 'vertical';

    let CONFIG = this.props.config;
    
    let font_check = CONFIG.font_size_main
    let font_size = (font_check !== '' && typeof font_check !== 'undefined' ? Number(CONFIG.font_size_main) : this.calculateFontSize(this.state.groupingLayout));
    font_size = font_size / EM;
    
    this.setState({
      fontSize: font_size,
      groupingLayout
    })
  }

  render() {
    const {config, data} = this.props;

    return (
      <DataPointsWrapper
        layout={this.getLayout()}
        font={config['grouping_font']}
        style={{fontSize: `${this.state.fontSize}em`}}
      >
        {data
          .map((dataPoint, index) => {
            const hasComparison = (dataPoint as ComparisonValue).comparison !== undefined
            return (
              <>
                <DataPoint>
                  <DataPointValueContainer titlePlacement={config.title_placement}>
                    {dataPoint.label === null ? null : (
                      <DataPointTitle color='gray'>
                        {dataPoint.label}
                      </DataPointTitle>
                    )}
                    <DataPointValue 
                      color={config.value_color}
                      onClick={() => { handleClick(dataPoint.link, event) }}
                    >
                      {dataPoint.formattedValue}
                    </DataPointValue>
                  </DataPointValueContainer>
                  {hasComparison && (
                      <DataPointComparison 
                        config={config}
                        dataPoint={dataPoint as ComparisonValue}
                        handleClick={handleClick}
                      />
                    )
                  }
                </DataPoint>
                {config.dividers && config.orientation === 'horizontal' && index < (data.length - 1) &&
                  <Divider />
                }
              </>
            )
          })
        }
      </DataPointsWrapper>
    )
  }
}

export default MultipleSingleValues;
