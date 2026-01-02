export interface _Image{
    // dataset building
    File: string,
    Split: '' | 'Train' | 'Test' | 'Predict',

    // dataset building project management
    Annotator?: number,
    Annotated_at?: Date,

    // dataset analysis
    Filmed_location?: string,
    Filmed_at?: Date,
    Source?: string
}