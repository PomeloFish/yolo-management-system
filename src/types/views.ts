import { Class } from './tables';

export interface Work{

    a_name?: string,
    a_id?: number,

    i_file?: string,
    annotated_at: Date,

    l_class?: number,
    height?: number,
    width?: number,
    center_x?: number,
    center_y?: number
};

export interface Work_count{
    a_id: number,
    a_name: string,
    
    file_count: number,
    label_count: number
};

export interface Instance extends Class{
    image: string,
    height: number,
    width: number,
    center_x: number,
    center_y: number
};

export interface Instance_count extends Class{
    i_count: number
}