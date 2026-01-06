export interface Image{
    // dataset building
    file?: string,
    split?: '' | 'Train' | 'Test' | 'Predict',

    // dataset building project management
    annotator?: number,
    annotated_at?: Date,

    // dataset analysis
    filmed_location?: string,
    filmed_at?: Date,
    source?: string
}