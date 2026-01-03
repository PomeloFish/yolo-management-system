import { Pool, PoolConfig } from "pg";
import * as fs from 'fs';
import { Image } from '../../types/Image';
import { Class } from '../../types/Class';
import { Annotator } from '../../types/Annotator';
import { Label } from '../../types/Label';

class parameterizedSearchQuery{
    sql: string
    params: any[]

    constructor(table: string, pattern, columns = ['*']){
        let conditions: string[] = [];
        let params: any[] = [];
        let paramIndex = 1;     // this might be changed to an external parameter 
                                // to insert correct indexes to a nested query
        for (const [key, value] of Object.entries(pattern)){
            switch (typeof value) {
                case 'number':
                    conditions.push(`${key} = $${paramIndex++}`);
                    params.push(value);
                    break;
                case 'string':
                    conditions.push(`${key} ILIKE '%' || $${paramIndex++} || '%'`);
                    params.push(value);
                    break;
                case 'object':
                    conditions.push(`${key} = $${paramIndex++}`);
                    params.push((new Date(value as Date)).toLocaleDateString());
                default:
                    break;
            }
        }
        this.sql = `SELECT ${columns.join(', ')} FROM ${table}` + (
            params.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ``
        );
        this.params = params;
    }
}

class CRUDTools {

    static async getAll(pool: Pool, table: string, columns: string[] = ['*']){
        const client = await pool.connect();
        const result = (await client.query(`
            SELECT ${columns.join(', ')} FROM ${table};    
        `)).rows;
        client.release();
        return result;
    }

    static async search(pool: Pool, query: parameterizedSearchQuery) {

        const client = await pool.connect();
        const result = (await client.query(query.sql, query.params)).rows;
        client.release();
        return result;
    }
}

export class Database {
    private pool: Pool;

    constructor(config: PoolConfig){

        this.pool = new Pool(config);

        fs.readFile('./src/backend/database/table_defination.sql', (err, data) => {
            if (err) throw err;
            this.pool.query(data.toString());
        });
    }

    async getAllImages(columns: string[] = ['*']){
        return CRUDTools.getAll(this.pool, 'Images', columns) as Promise<Image[]>;
    }
    async getAllClasses(columns: string[] = ['*']){
        return CRUDTools.getAll(this.pool, 'Classes', columns) as Promise<Class[]>;
    }
    async getAllAnnotators(columns: string[] = ['*']){
        return CRUDTools.getAll(this.pool, 'Annotators', columns) as Promise<Annotator[]>;
    }

    async searchImage(imageGiven: Image, columns: string[] = ['*']){
        return CRUDTools.search(this.pool, 
            new parameterizedSearchQuery('Images', imageGiven, columns)
        ) as Promise<Image[]>;
    }

    async getAllLabelsWithClass(classGiven: Class, columns: string[] = ['*']){

        const subSearch = new parameterizedSearchQuery('Classes', classGiven, ['ID']);

        // search.params must be empty, so there is no need to use concat
        // assign subSearch.params to search.params to use params from subSearch.sql
        const search = new parameterizedSearchQuery('Labels', {}, columns);
        search.sql += ` WHERE Class IN (${subSearch.sql})`;
        search.params = subSearch.params;

        return CRUDTools.search(this.pool, search) as Promise<Label[]>;
    }

    async getAnnotationsCreatedBySomeone(annotatorGiven: Annotator, columns: string[] = ['*']){
        const subQuery = new parameterizedSearchQuery('Annotators', annotatorGiven, ['ID']);

        const query = new parameterizedSearchQuery(
            'Images LEFT JOIN Labels ON Images.File = Labels.Image', {}, columns
        );
        query.sql += ` WHERE Annotator IN (${subQuery.sql})`;
        query.params = subQuery.params;

        return CRUDTools.search(this.pool, query);
    }

    async getWorkloadOfSomeone(annotatorGiven: Annotator){
        const subQuery = new parameterizedSearchQuery('Annotators', annotatorGiven, ['ID']);

        const query = new parameterizedSearchQuery(
            'Images LEFT JOIN Labels ON Images.File = Labels.Image', {}, [
                'COUNT(*) AS "The number of Annotations"',
                'COUNT(DISTINCT Image) AS "The number of Image"'
            ]
        );
        query.sql += ` WHERE Annotator IN (${subQuery.sql})`;
        query.params = subQuery.params;

        return CRUDTools.search(this.pool, query) as Promise<{
            "The number of Annotations": number,
            "The number of Image": number
        }[]>;
    }
}