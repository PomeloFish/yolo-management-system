export interface Annotator{
    a_id?: number,
    a_name?: string
}

export interface Image{
    // dataset building
    i_file?: string,
    split?: '' | 'Train' | 'Test' | 'Predict',

    // dataset building project management
    annotator?: number,
    annotated_at?: Date,

    // dataset analysis
    filmed_location?: string,
    filmed_at?: Date,
    source?: string
}

export interface Class{
    c_id?: number,
    english_name?: string,
    chinese_name?: string,
}

export interface Label{
    // bounding box
    height?: number,
    width?: number,
    center_X?: number,
    center_Y?: number,

    image?: string,
    l_class?: number,
}