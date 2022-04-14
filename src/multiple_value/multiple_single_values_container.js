import React from 'react';
import ReactDOM from 'react-dom';
import isEqual from 'lodash/isEqual';
import MultipleSingleValues from './MultipleSingleValues';
import { 
  BASE_OPTIONS,
  makeOptions,
  prepareData,
} from './utils';

let currentOptions = {}
let currentConfig = {}

looker.plugins.visualizations.add({
  id: "multiple_single_values",
  label: "Multiple Single Values",
  options: BASE_OPTIONS,
  create: function(element, config) {
    this.chart = ReactDOM.render(
      <MultipleSingleValues
        config={{}}
        data={[]}
      />,
      element
    );

  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    const measures = [].concat(
      queryResponse.fields.measures,
      queryResponse.fields.table_calculations
    )

    if(data.length < 1) {
      this.addError({title: "No Results"})
      done();
    }

    if (measures.length == 0) {
      this.addError({title: "No Measures", message: "This visualization requires measures"});
      return;
    }

    if (queryResponse.fields.pivots.length) {
      this.addError({title: "Pivoting not allowed", message: "This visualization does not allow pivoting"});
      return;
    }

    const options = makeOptions(config, measures);

    if (
      !isEqual(currentOptions, options) ||
      !isEqual(currentConfig, config)
    ) {
      this.trigger('registerOptions', options)
      currentOptions = Object.assign({}, options)
      currentConfig = Object.assign({}, config)
    }
  
    const dataPoints = prepareData(data, config, queryResponse.fields.dimensions, measures)

    this.chart = ReactDOM.render(
      <MultipleSingleValues
        config={config}
        data={dataPoints}
      />,
      element
    );
    done()
  }
});
