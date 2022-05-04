export type SingleValue = {
    label: string,
    link: any,
    value: number,
    formattedValue: string,
};

export type ComparisonValue = SingleValue & {
    comparison: SingleValue,
}

export type AppearanceSettings = {
    orientation: string,
    font_size_main: string,
    grouping_font: string,
    title_placement: string,
    value_color: string,
    value_labels: string,
    comparison_show_label: boolean,
    pos_is_bad: boolean,
    dividers: boolean
}