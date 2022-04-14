project_name: "viz-value-list_fivetran"

constant: VIS_LABEL {
  value: "Multiple Single Values"
  export: override_optional
}

constant: VIS_ID {
  value: "multiple_single_values_id"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://marketplace-api.looker.com/viz-dist/multiple_value.js"
  label: "@{VIS_LABEL}"
}
