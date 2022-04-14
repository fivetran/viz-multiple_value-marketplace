import { formatValue } from './looker_utils';
import { ComparisonValue, SingleValue } from './types';

const makeLabelGetter: 
    (config: any, dimensions: any[]) => (dataItem: any, measure: any) => string = 
    (config: any, dimensions: any[]) => {
    switch (config.title) {
        case 'field':
        return (dataItem, measure) => measure.label_short || measure.label;
        case 'dimension':
            if (dimensions.length > 0) {
                const dimensionName = dimensions[0].name;
                const titleFormat = config.title_format;
                return (dataItem, measure) => formatValue(dataItem[dimensionName], titleFormat);
            }
            return (dataItem, measure) => null;
        case 'custom':
            return (dataItem, measure) => config.title_override;
        default:
            return (dataItem, measure) => null;
    }
}

const makeComparisonLabelGetter: 
    (config: any) => (dataItem: any, measure: any) => string = 
    (config: any) => {
    if (config.comparison_show_label === undefined || !config.comparison_show_label) {
        return (dataItem, measure) => null;
    }
    if (config.label_override) {
        return (dataItem, measure) => config.label_override;
    }
    return (dataItem, measure) => measure.label_short || measure.label;
}

const makeDataPoint = (
    dataItem: any, 
    measure: any,
    valueFormat: string,
    labelGetter: (dataItem: any, measure: any) => string
) => {
    let measureName = measure.name;
    let dataItemMeasure = dataItem[measureName];

    let dataPointLabel = labelGetter(dataItem, measure);

    return ({
        name: measureName,
        label: dataPointLabel,
        link: dataItemMeasure.links,
        value: dataItemMeasure.value,
        formattedValue: formatValue(dataItemMeasure, valueFormat),
    });
};

const makeComparisonDataPoint = (
    dataItem: any, 
    measure: any, 
    comparisonMeasure: any,
    valueFormat: string, 
    labelGetter: (dataItem: any, measure: any) => string, 
    comparisonLabelGetter: (dataItem: any, measure: any) => string
) => {
    return {
        ...makeDataPoint(dataItem, measure, valueFormat, labelGetter),
        comparison: makeDataPoint(dataItem, comparisonMeasure, valueFormat, comparisonLabelGetter)
    };
}

export const prepareData = (
    data: any[],
    config: any, 
    dimensions: any[], 
    measures: any[]
) => {
    const actualMeasure = measures[0];
    const comparisonMeasure = (measures.length > 1 && config.show_comparison) ? measures[1] : null;

    const labelGetter = makeLabelGetter(config, dimensions);
    const valueFormat = config.value_format;

    let dataPoints: (SingleValue | ComparisonValue)[];
    if (comparisonMeasure !== null) {
      const comparisonLabelGetter = makeComparisonLabelGetter(config);
      dataPoints = data.map(dataItem => makeComparisonDataPoint(dataItem, actualMeasure, comparisonMeasure, valueFormat, labelGetter, comparisonLabelGetter));
    } else {
      dataPoints = data.map(dataItem => makeDataPoint(dataItem, actualMeasure, valueFormat, labelGetter));
    }
    return dataPoints;
}

export const BASE_OPTIONS = {
    font_size_main: {
      label: 'Font Size',
      type: 'string',
      section: 'Style',
      default: '',
      order: 0,
      display_size: 'half'
    },
    orientation: {
      label: 'Orientation',
      type: 'string',
      section: 'Style',
      display: 'select',
      values: [
        {'Auto': 'auto'},
        {'Vertical': 'vertical'},
        {'Horizontal': 'horizontal'}
      ],
      default: 'auto',
      order: 10,
      display_size: 'half'
    },
    value_color: {
      type: 'string',
      label: 'Value Color',
      display: 'color',
      default: '',
      section: 'Style',
      order: 50,
    },
    value_format: {
      type: 'string',
      label: 'Value Format',
      default: '',
      section: 'Style',
      placeholder: 'Spreadsheet-style format code',
      order: 60,
    },
    title: {
      type: 'string',
      label: 'Title',
      display: 'select',
      values: [
        {'None': 'none'},
        {'Field Label': 'field'},
        {'Dimension Value': 'dimension'},
        {'Custom': 'custom'},
      ],
      default: 'none',
      section: 'Style',
      order: 20,
    }
  }

export const makeOptions = (
    config:any,
    measures: any[]
) => {
    let options: any = Object.assign({}, BASE_OPTIONS)
    
    if (config.orientation === "horizontal") {
      options.dividers = {
        type: 'boolean',
        label: `Dividers between values?`,
        default: false,
        section: 'Style',
        order: 70,
      };
    }
    if (measures.length > 1) {
      options.show_comparison = {
        type: 'boolean',
        label: `Show Comparison`,
        section: 'Comparison',
        default: false,
        order: 80,
      };
    }
    if (config.show_comparison === true) {
      options.value_labels = {
        type: 'string',
        label: `Value Labels`,
        display: 'select',
        values: [
          {'Show As Value': 'value'},
          {'Show As Change': 'change'},
          {'Calculate Progress': 'progress'},
          {'Calculate Progress (with Percentage)': 'progress_percentage'},
        ],
        default: 'value',
        section: 'Comparison',
        order: 90,
      };
      options.comparison_show_label = {
        type: 'boolean',
        label: 'Show Label',
        default: 'false',
        section: 'Comparison',
        order: 110,
      };
    }
    if (config.comparison_show_label === true) {
      options.label_override = {
        type: 'string',
        label: `Label Override`,
        default: '',
        placeholder: 'Leave blank to use field label',
        section: 'Comparison',
        order: 120,
      };
    }
    if (config.title !== 'none') {
      options.title_placement = {
        type: 'string',
        label: 'Title Placement',
        display: 'select',
        values: [
          {'Above': 'above'},
          {'Below': 'below'},
        ],
        default: 'above',
        section: 'Style',
        order: 30,
      };
    }
    if (config.title === 'custom') {
      options.title_override = {
        type: 'string',
        label: 'Title Override',
        default: '',
        section: 'Style',
        order: 40,
      };
    }
    if (config.title === 'dimension') {
      options.title_format = {
        type: 'string',
        label: 'Title Format',
        default: '',
        section: 'Style',
        order: 40,
      };
    }
    if (config.value_labels === 'change') {
      options.pos_is_bad = {
        type: 'boolean',
        label: 'Positive Value Is Bad',
        default: false,
        section: 'Comparison',
        order: 100,
      };
    }

    return options
}