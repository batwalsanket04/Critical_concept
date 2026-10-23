const pool = require("../Config/Connection");


const createAuditLog = async(client,data)=>{

    const {
        user_id,
        action,
        entity,
        entity_id,
        old_data,
        new_data,
        ip_address
    } = data;


    await client.query(
        `
        INSERT INTO audit_logs
        (
        user_id,
        action,
        entity,
        entity_id,
        old_data,
        new_data,
        ip_address
        )

        VALUES($1,$2,$3,$4,$5,$6,$7)

        `,
        [
            data.user_id,
data.action,
data.entity,
data.entity_id,
data.old_data,
JSON.stringify(data.new_data),
data.ip_address
        ]
    );

};

const getAuditLogs = async(req,res)=>{

    try {

        let {
            search,
            action,
            entity,
            page,
            limit
        } = req.query;


        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;


        const offset = (page - 1) * limit;


        let query = `
        SELECT 
            a.*,
            u.fname,
            u.email

        FROM audit_logs a

        LEFT JOIN users u
        ON a.user_id = u.id

        WHERE 1=1
        `;


        let values = [];
        let index = 1;



        // Search filter

        if(search){

            query += `
            AND (
                u.fname ILIKE $${index}
                OR
                u.email ILIKE $${index}
            )
            `;

            values.push(`%${search}%`);

            index++;

        }



        // Action filter

        if(action){

            query += `
            AND a.action=$${index}
            `;

            values.push(action);

            index++;

        }



        // Entity filter

        if(entity){

            query += `
            AND a.entity=$${index}
            `;

            values.push(entity);

            index++;

        }



        query += `
        ORDER BY a.created_at DESC

        LIMIT $${index}
        OFFSET $${index+1}
        `;


        values.push(limit);
        values.push(offset);



        const result = await pool.query(
            query,
            values
        );



        res.status(200).json({

            logs:result.rows,

            pagination:{
                page,
                limit,
                count:result.rows.length
            }

        });



    } catch(error){

        res.status(500).json({
            error:error.message
        });

    }

}


module.exports={
    createAuditLog,getAuditLogs
};