import { Pool, PoolConfig } from 'pg';
import * as fs from 'fs';
import { Image } from '../../types/tables';


class whereClause{
    sql: string
    params: any[]

    constructor(pattern){
        let conditions: string[] = [];
        let params: any[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(pattern)){
            switch (typeof value) {
                case 'number':
                    conditions.push(`"${key}" = $${paramIndex++}`);
                    params.push(value);
                    break;
                case 'string':
                    conditions.push(`"${key}" ILIKE '%' || $${paramIndex++} || '%'`);
                    params.push(value);
                    break;
                case 'object':
                    conditions.push(`"${key}" = $${paramIndex++}`);
                    params.push((value as Date)?.toLocaleDateString());
                default:
                    break;
            }
        }
        this.sql = params.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ``;
        this.params = params;
        console.log(this.sql);
    }
}

export class Database {
    private pool: Pool;

    constructor(config: PoolConfig, initSqlFile: string = ''){
        this.pool = new Pool(config);

        if (initSqlFile === '') return;
        fs.readFile(initSqlFile, (err, data) => {
            if (err) 
                console.error(err);
            else
                this.pool.query(data.toString());
        });
    }

    async query(sql: string, params:any[] = []){
        const client = await this.pool.connect();
        const result = await client.query(sql, params);
        client.release();
        return result;
    }

    async getAll<T>(table: string, columns: string[] = ['*']){
        return (await this.query(`
            SELECT ${columns.join(', ')} FROM ${table}
            `)).rows as T[];
    }

    async search<T>(table: string, pattern: T, columns: string[] = ['*']){
        const wClause = new whereClause(pattern);
        return (await this.query(
            `SELECT ${columns.join(', ')} FROM ${table}` + wClause.sql, wClause.params
        )).rows as T[];
    }

    async clearSplit(columns: string[] = ['*']){
        return this.getAll<Image>('clear_split()', columns);
    }

    async splitDataset(test_size: number, columns: string[] = ['*']){
        if (test_size < 0.0 || test_size > 1.0) return;

        return this.getAll<Image>(
            `split_train_and_test(${test_size})`, columns
        );
    }
}