"use client";
import { useState, useEffect } from "react";

export default function EditOwnership({ type, unit, inline = false, onSave }) {
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [roles, setRoles] = useState([]);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    // Load roles and orgs
    fetch('/api/roles').then(r => r.json()).then(setRoles).catch(() => {});
    fetch('/api/orgs').then(r => r.json()).then(setOrgs).catch(() => {});
    
    // Set initial values
    if (type === 'expected') {
      setRole(unit.expected_role || '');
      setOrg(unit.expected_org || '');
    } else {
      setRole(unit.observed_role || '');
      setOrg(unit.observed_org || '');
    }
  }, [unit, type]);

  const handleSave = async () => {
    const endpoint = type === 'expected' ? '/api/expected' : '/api/ownership';
    
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: unit.unit_id,
        role,
        org
      })
    });

    setIsEditing(false);
    if (onSave) onSave();
  };

  if (inline && !isEditing) {
    return (
      <div 
        className="cursor-pointer hover:bg-white p-1 rounded"
        onClick={() => setIsEditing(true)}
      >
        {role && org ? `${role}@${org}` : <span className="text-gray-400">Click to set</span>}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <select 
        className="border rounded px-1 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="SALES_LEAD">SALES_LEAD</option>
        <option value="DELIVERY_LEAD">DELIVERY_LEAD</option>
        <option value="FINANCE_LEAD">FINANCE_LEAD</option>
        <option value="TECH_LEAD">TECH_LEAD</option>
        <option value="PEOPLE_LEAD">PEOPLE_LEAD</option>
      </select>
      
      <select 
        className="border rounded px-1 text-sm"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
      >
        <option value="">Select Org</option>
        <option value="GROWTH">GROWTH</option>
        <option value="SERVICE">SERVICE</option>
        <option value="OPERATIONS">OPERATIONS</option>
        <option value="GROWTH_SALES">GROWTH_SALES</option>
        <option value="SERVICE_DELIVERY">SERVICE_DELIVERY</option>
      </select>
      
      <button 
        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
        onClick={handleSave}
      >
        Save
      </button>
      
      {inline && (
        <button 
          className="text-gray-500 px-2 py-1 rounded text-sm"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      )}
    </div>
  );
}