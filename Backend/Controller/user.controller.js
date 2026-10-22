const pool= require("../Config/Connection.js")
const bcrypt=require('bcrypt')
const JWT=require('jsonwebtoken')
const asyncHandler=require("../middleware/asyncHandler.js")
const { createAuditLog } = require("./audit.controller.js");

const Singup=async(req,res)=>{

    try{

  const {fname, role, email, password}=req.body;
      console.log("BODY:", req.body);

        if(!fname || !role || !email || !password) return res.status(400).json({message:"All Field required"})

        const PassRegex= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if(!PassRegex.test(password)) return res.status(400).json({message:"Password must be lowercase,uppercase,symbols and numbers"})
        
        
          const userExist = await pool.query(

            "SELECT * FROM users WHERE email=$1",
            [email]
        );
        
        if(userExist.rows.length > 0){
            return res.status(400).json({
                message:"User already exists"
            });
        }
        
        const hashPass=await bcrypt.hash(password,10);

         const result = await pool.query(
            `INSERT INTO users(fname,role,email,password)
             VALUES($1,$2,$3,$4)
             RETURNING id,fname,role,email`,
          [
    fname,
    role,
    email,
    hashPass
]
        );

        if (result.rows.length === 0) {
            return res.status(500).json({message:"Default user role is not configured"});
        }


 await createAuditLog({

    user_id:result.rows[0].id,

    action:"CREATE",

    entity:"users",

    entity_id:result.rows[0].id,

    old_data:null,

    new_data:result.rows[0],

    ip_address:req.ip

});

        res.status(201).json({message:"Signup Successfully..",
            user:result.rows[0]
        });


        




    }catch(error)
    {
      res.status(500).json({
        error:error.message
      });

    }
}


const login=async(req,res)=>{
    try
    {

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


        await createAuditLog({
           
    user_id:user.id,

    action:"LOGIN",

    entity:"users",

    entity_id:null,

    old_data:null,

    new_data:null,

    ip_address:req.ip

});

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
    })

    



    }catch(error)
    {
         console.log(error);

        res.status(500).json({
            error:error.message
        })

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

    let {page,limit}=req.query;


    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;


    const offset = (page - 1) * limit;


    // Get users
    const users = await pool.query(
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
    const total = await pool.query(
        `
        SELECT COUNT(*) 
        FROM users
        `
    );


    const totalRecords = Number(total.rows[0].count);


    const totalPages = Math.ceil(
        totalRecords / limit
    );


    await createAuditLog({

    user_id:req.user?.id || null,

    action:"READ",

    entity:"users",

    entity_id:null,

    old_data:null,

    new_data:null,

    ip_address:req.ip

});


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

    


});


const getUserById = async(req,res)=>{
    try{

        const { id } = req.params;


        if(!/^\d+$/.test(id)){
            return res.status(400).json({
                message:"Invalid user id"
            });
        }


       const oldUser = await pool.query(
"SELECT * FROM users WHERE id=$1",
[id]
);


if(oldUser.rows.length === 0){

    return res.status(404).json({
        message:"User not found"
    });

}

const result = await pool.query(`
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
    try{
        const { id } = req.params;
        const oldData = await pool.query(
"SELECT * FROM users WHERE id=$1",
[id]
);

if(oldData.rows.length===0){
 return res.status(404).json({
   message:"User not found"
 });
}
 
        const { fname, email } = req.body;

        if(!/^\d+$/.test(id)){
            return res.status(400).json({message:"Invalid user id"});
        }

        if(!fname || !email){
            return res.status(400).json({message:"Name and email are required"});
        }

        const result = await pool.query(
            `UPDATE users
             SET fname=$1, email=$2
             WHERE id=$3
             RETURNING id, fname, role, email`,
            [fname, email, id]
        );

        if(result.rows.length === 0){
            return res.status(404).json({message:"User not found"});
        }


                await createAuditLog({

user_id:req.user?.id || null,

action:"UPDATE",

entity:"users",

entity_id:id,

old_data:oldData.rows[0],

new_data:result.rows[0],

ip_address:req.ip

});

        res.status(200).json({
            message:"User updated successfully",
            user:result.rows[0]
        });


    }catch(error){
        if(error.code === "23505"){
            return res.status(409).json({message:"Email is already in use"});
        }

        res.status(500).json({error:error.message});
    }
}


const deleteByID=async(req,res)=>
{
    try{
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

        await createAuditLog({
 user_id:req.user.id,
 action:"DELETE",
 entity:"users",
 entity_id:id,
 old_data:oldUser.rows[0],
 new_data:null,
 ip_address:req.ip
});


           res.status(200).json({
            message:"User deleted successfully"
        });

  

    }catch(error)
    {

           res.status(500).json({
            error:error.message
        });

    }
}

const deleteAllUsers = async(req,res)=>{

    try{

        const result = await pool.query(
            "DELETE FROM users RETURNING id"
        );

       await createAuditLog({

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


res.status(200).json({
    message: result.rows.length
        ? "All users deleted successfully"
        : "No users found to delete",
    deletedUsers: result.rows.length
});


    }catch(error){

        console.log(error);

        res.status(500).json({

            error:error.message

        });

    }

};

module.exports = {
    Singup,login,getAllData,getUserById,updateUser,deleteByID,refreshToken,deleteAllUsers
}
