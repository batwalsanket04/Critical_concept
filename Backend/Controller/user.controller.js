const pool= require("../Config/Connection.js")
const bcrypt=require('bcrypt')
const JWT=require('jsonwebtoken')
const asyncHandler=require("../middleware/asyncHandler.js")
const {createAuditLog}  = require("./audit.controller.js");

const Singup = async(req,res,next)=>{

const client = await pool.connect();


    try{


        const {
            fname,
            role,
            email,
            password
        } = req.body;

        await client.query("BEGIN")


        console.log("BODY:",req.body);


        const userExist = await client.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );


        if(userExist.rows.length > 0){
            await client.query("ROLLBACK");

            return res.status(400).json({
                message:"User already exists"
            });

        }


        const hashPass = await bcrypt.hash(password,10);


        const result = await client.query(
            `
            INSERT INTO users
            (
            fname,
            role,
            email,
            password
            )

            VALUES($1,$2,$3,$4)

            RETURNING id,fname,role,email
            `,
            [
                fname,
                role,
                email,
                hashPass
            ]
        );

 


        await createAuditLog(client, {
    user_id: result.rows[0].id,
    action: "CREATE",
    entity: "users",
    entity_id: result.rows[0].id,
    old_data: null,
    new_data: result.rows[0],
    ip_address: req.ip
});

        await client.query("COMMIT");

        res.status(201).json({

            message:"Signup Successfully",

            user:result.rows[0]

        });


    }
    catch(error){
        
        await client.query("ROLLBACK");
        next(error);

    }finally{
        client.release();
    }

}


const login=async(req,res)=>{


    const client = await pool.connect();
    try
    {

        await client.query("BEGIN")

        const {email,password}=req.body;


        if(!email || !password) return res.status(400).json({message:"All field required"})

           const userResult = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if(userResult.rows.length === 0){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const user=userResult.rows[0];

        const isMatch=await bcrypt.compare(password,user.password);

        if(!isMatch) return res.status(401).json({
            message:"Invalid password"
        })


        const token = JWT.sign({
            id:user.id,
            email:user.email,
            role:user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"1h"
        }
    );

    const refreshToken = JWT.sign(
        {
            id: user.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );

     res.cookie(
        "refreshToken",
        refreshToken,
        {
            httpOnly: true,
            secure: false,   // true in production HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    );

await createAuditLog(client,{
   user_id:user.id,
   action:"LOGIN",
   entity:"users",
   entity_id:null,
   old_data:null,
   new_data:null,
   ip_address:req.ip
});

await client.query("COMMIT");

res.status(200).json({
    message:"login Successfully.",
    success:true,
    token,
    user:{
        id:user.id,
        fname:user.fname,
        email:user.email,
        role:user.role
    }
});


    }catch(error)
    {
         console.log(error);
             await client.query("ROLLBACK");

        res.status(500).json({
            error:error.message
        })

    }
    finally{
    client.release();
}
}

const refreshToken = async(req,res)=>{

    try{

        const token = req.cookies.refreshToken;
     console.log("Cookie:", req.cookies);


        if(!token){
            return res.status(401).json({
                message:"Refresh token not found"
            });
        }


        JWT.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET,
            (error,user)=>{


                if(error){
                    return res.status(403).json({
                        message:"Invalid refresh token"
                    });
                }



                const newAccessToken = JWT.sign(
                    {
                        id:user.id
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:"1h"
                    }
                );



                res.status(200).json({

                    message:"Access token refreshed",

                    token:newAccessToken

                });


            }
        );


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

}


const getAllData = asyncHandler(async(req,res)=>{
    const client = await pool.connect();

    try{
    let {page,limit}=req.query;


    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;


    const offset = (page - 1) * limit;



await client.query("BEGIN");
    // Get users
    const users = await client.query(
        `
        SELECT id,fname,email,role,created_at
        FROM users
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
        `,
        [
            limit,
            offset
        ]
    );


    // Count total users
    const total = await client.query(
        `
        SELECT COUNT(*) 
        FROM users
        `
    );


    const totalRecords = Number(total.rows[0].count);


    const totalPages = Math.ceil(
        totalRecords / limit
    );


    await createAuditLog(client,{

   user_id:req.user?.id || null,

    action:"READ",

    entity:"users",

    entity_id:null,

    old_data:null,

    new_data:null,

    ip_address:req.ip

});

        await client.query("COMMIT");


    res.status(200).json({

        message:"Users fetched successfully",

        users:users.rows,


        pagination:{
            currentPage:page,
            totalPages:totalPages,
            totalRecords:totalRecords,
            limit:limit
        }

    });
}catch(error)
{
await client.query("ROLLBACK");
}

finally{
client.release();
}
    


});


const getUserById = async(req,res)=>{
    const client = await pool.connect();
    try{

        const { id } = req.params;


        if(!/^\d+$/.test(id)){
            return res.status(400).json({
                message:"Invalid user id"
            });
        }


       const oldUser = await client.query(
"SELECT * FROM users WHERE id=$1",
[id]
);


if(oldUser.rows.length === 0){

    return res.status(404).json({
        message:"User not found"
    });

}

const result = await client.query(`
SELECT id, fname, role, email
FROM users
WHERE id=$1
`, [id]);

        res.status(200).json({

            message:"User fetched successfully",

            user:result.rows[0]

        });


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }
}

const updateUser = async(req,res)=>{
    const client = await pool.connect();
    try{
        await client.query("BEGIN");
        const { id } = req.params;
        const oldData = await client.query(
"SELECT * FROM users WHERE id=$1",
[id]
);

if(oldData.rows.length===0){
 return res.status(404).json({
   message:"User not found"
 });
}

const {fname,email}=req.body;
 
        

        const result = await client.query(
            `UPDATE users
             SET fname=$1, email=$2
             WHERE id=$3
             RETURNING id, fname, role, email`,
            [fname, email, id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({message:"User not found"});
        }


                await createAuditLog(client,{

user_id:req.user?.id || null,

action:"UPDATE",

entity:"users",

entity_id:id,

old_data:oldData.rows[0],

new_data:result.rows[0],

ip_address:req.ip

});

 await client.query("COMMIT");

        res.status(200).json({
            message:"User updated successfully",
            user:result.rows[0]
        });


    }catch(error){
         await client.query("ROLLBACK");
        if(error.code === "23505"){
            return res.status(409).json({message:"Email is already in use"});
        }

        res.status(500).json({error:error.message});
    }
    finally{
    client.release();
}
}


const deleteByID=async(req,res)=>
{
    const client = await pool.connect();
    try{
        await client.query("BEGIN");
       const {id}=req.params;
        const oldUser = await pool.query(
"SELECT * FROM users WHERE id=$1",
[id]
);
    

        if(!/^\d+$/.test(id)){
            return res.status(400).json({message:"Invalid user id"});
        }

                const result = await pool.query(
            `
            DELETE FROM users
            WHERE id=$1
            RETURNING *
            `,
            [id]
        );

          if(oldUser.rows.length === 0){

            return res.status(404).json({
                message:"User not found"
            });

        }

 await createAuditLog(client,{
    user_id:req.user?.id || null,
    action:"DELETE",
    entity:"users",
    entity_id:id,
    old_data:oldUser.rows[0],
    new_data:null,
    ip_address:req.ip
});


await client.query(
`
DELETE FROM users
WHERE id=$1
`,
[id]
);


await client.query("COMMIT");

           res.status(200).json({
            message:"User deleted successfully"
        });

  

    }catch(error)
    {

await client.query("ROLLBACK");

           res.status(500).json({
            error:error.message
        });

    }
    finally{

client.release();

}
}

const deleteAllUsers = async(req,res)=>{

    const client = await pool.connect();


    try{
await client.query("BEGIN");
        const result = await client.query(
            "DELETE FROM users RETURNING id"
        );

       await createAuditLog(client,{

    user_id:req.user.id,

    action:"DELETE_ALL",

    entity:"users",

    entity_id:null,

    old_data:{
        deletedUsers:result.rows.length
    },

    new_data:null,

    ip_address:req.ip

});
await client.query("COMMIT")


res.status(200).json({
    message: result.rows.length
        ? "All users deleted successfully"
        : "No users found to delete",
    deletedUsers: result.rows.length
});


    }catch(error){

        await client.query("ROLLBACK");

        console.log(error);

        res.status(500).json({

            error:error.message

        });

    }
    finally{

client.release();

}

};

module.exports = {
    Singup,login,getAllData,getUserById,updateUser,deleteByID,refreshToken,deleteAllUsers
}
