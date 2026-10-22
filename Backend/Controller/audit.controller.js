const pool = require("../Config/Connection");


const createAuditLog = async(data)=>{

    const {
        user_id,
        action,
        entity,
        entity_id,
        old_data,
        new_data,
        ip_address
    } = data;


    await pool.query(
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
            user_id,
            action,
            entity,
            entity_id,
            old_data,
            new_data,
            ip_address
        ]
    );

};

const getAuditLogs = async(req,res)=>{


const result = await pool.query(
`
SELECT 
a.*,
u.fname,
u.email

FROM audit_logs a

LEFT JOIN users u

ON a.user_id=u.id

ORDER BY a.created_at DESC

`
);


res.json({
logs:result.rows
});


}


module.exports={
    createAuditLog,getAuditLogs
};