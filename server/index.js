import snowflake from 'snowflake-sdk';

export function establishConnection () {
    const connection = snowflake.createConnection({

        account: 'dg26963.us-east-2.aws',
        username: 'SHIVASURYA',
        password: 'ShivaSurya#123',
        warehouse: 'BIZ'
        
    });
    return new Promise((resolve, reject) => {
        connection.connect((err, conn) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}

export function getTableContext(connection, dbName) {

    return new Promise((resolve, reject) => {

        try {
            const dataContext = getTable(connection, dbName);
            resolve(dataContext)
        } catch (err) {
            console.error('An error occurred:', err.message);
            reject(err);
        }
    });
}

async function getTable(connection, dbName) {
    const tableNames = await new Promise((resolve, reject) => {
        connection.execute({
            sqlText: `
                SELECT TABLE_NAME, COMMENT FROM ${dbName}.INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'PUBLIC'
            `,
            complete: (err, stmt, rows) => {
                if (err) {
                    console.error('Failed to execute statement: ' + err.message);
                    reject(err);
                } else {
                    const tables = rows.map(row => ({ name: row.TABLE_NAME, comment: row.COMMENT }));
                    resolve(tables);
                }
            }
        });
    });

    let context = '';

    for (const tableInfo of tableNames) {
        context = await getColumn(connection, dbName, tableInfo.name, context);
        context = await getData(connection, dbName, tableInfo.name, context);
    }

    return context;
}

async function getColumn(connection, dbName, table, context) {
    return new Promise((resolve, reject) => {
        connection.execute({ 
            sqlText: `
                SELECT COLUMN_NAME, DATA_TYPE FROM ${dbName}.INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = '${table}'
            `,
            complete: (err, stmt, rows) => {
                if (err) {
                    console.error(`Failed to execute statement for table ${table}: ${err.message}`);
                    reject(err);
                } else {
                    const columns = rows.map(row => `**${row.COLUMN_NAME}** : ${row.DATA_TYPE}`).join('\n');
                    context = context + `<columns>\n\n${columns}\n\n</columns>`;
                    resolve(context);
                }
            }
        });
    });
}

async function getData(connection, dbName, table, context){
    return new Promise((resolve, reject) => {
        connection.execute({ 
            sqlText: `
                SELECT * FROM ${dbName}.PUBLIC.${table} 
            `,
            complete: (err, stmt, rows) => {
                if (err) {
                    console.error('Failed to execute statement: ' + err.smessage);
                    reject(err);
                } else {
                    const value = JSON.stringify(rows)
                    context = context + `\n\nAvailable variables by ${table}:\n\n${value}`;
                    resolve(context);
                }
            }
        });
    });
}