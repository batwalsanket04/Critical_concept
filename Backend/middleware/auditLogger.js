const { createAuditLog } = require("../Controller/audit.controller");


const auditLogger = ({
    action,
    entity
}) => {

    return async(req,res,next)=>{

        try{


            // Store original response
            const originalJson = res.json;


            res.json = async function(data){


                await createAuditLog({

                    user_id: req.user?.id || null,

                    action: action,

                    entity: entity,

                    entity_id:
                    req.params.id || 
                    data?.user?.id ||
                    null,


                    old_data:
                    req.oldData || null,


                    new_data:
                    data?.user || null,


                    ip_address:req.ip

                });


                return originalJson.call(this,data);

            };


            next();


        }catch(error){

            console.log(
              "Audit Error:",
              error.message
            );

            next();

        }

    }

}


module.exports = auditLogger;