'use strict';
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,service:'netregent',engine:'local-retrieval-composer',n8n:false});};
