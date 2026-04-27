import React, { createContext, useContext, useState } from 'react'

const SidebarContext = createContext({ 
  open: false, 
  collapsed: false,
  toggle: () => {}, 
  toggleCollapse: () => {},
  close: () => {} 
})

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false) // Mobile overlay
  const [collapsed, setCollapsed] = useState(false) // Desktop collapsed state
  
  const toggle = () => setOpen((v) => !v)
  const toggleCollapse = () => setCollapsed((v) => !v)
  const close = () => setOpen(false)
  
  return (
    <SidebarContext.Provider value={{ open, collapsed, toggle, toggleCollapse, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
