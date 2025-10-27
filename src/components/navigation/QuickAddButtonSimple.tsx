"use client";
import React from "react";

export default function QuickAddButtonSimple() {
  console.log("🔴 QuickAddButtonSimple rendering!");
  
  // Add alert to test if component runs at all
  React.useEffect(() => {
    console.log("🔴 QuickAddButtonSimple useEffect running!");
    alert("QuickAddButton component is working!");
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '60px',
      height: '60px',
      backgroundColor: 'red',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      zIndex: 9999,
      fontSize: '24px',
      cursor: 'pointer'
    }}>
      +
    </div>
  );
}