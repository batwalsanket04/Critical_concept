import React from 'react'
import { useState } from 'react';
import { createContext } from 'react'


export const AuditContext=createContext();


export const AuditProvider = ({children}) => {


    const [search,setSearch]=useState("");
    const [action,setAction]=useState("")
    const [loading,setLoading]=useState(false)

    const value={search,setSearch,action,setAction,loading,setLoading}


  return (
  <AuditContext.Provider value={value}>

    {children}
  </AuditContext.Provider>
  )
}

export default AuditProvider