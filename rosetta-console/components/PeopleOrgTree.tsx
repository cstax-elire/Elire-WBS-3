"use client";

export default function PeopleOrgTree({ orgData }) {
  const updatePerson = async (personId, field, value) => {
    await fetch('/api/person', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, field, value })
    });
  };

  return (
    <div className="p-4">
      {renderOrgNode(orgData.root)}
    </div>
  );
  
  function renderOrgNode(node, depth = 0) {
    return (
      <div key={node.org_unit_id} style={{ marginLeft: depth * 20 }}>
        <div className="border rounded p-3 mb-2">
          <div className="flex justify-between">
            <div>
              <span className="font-medium">{node.name}</span>
              <span className="ml-2 text-gray-500">({node.code})</span>
            </div>
            <button className="text-blue-600">+ Add Person</button>
          </div>
          
          {/* People in this org */}
          <div className="mt-2 space-y-1">
            {node.people?.map(person => (
              <div key={person.person_id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                <input 
                  className="border rounded px-1"
                  value={person.full_name}
                  onChange={(e) => updatePerson(person.person_id, 'name', e.target.value)}
                />
                <input 
                  type="number"
                  className="w-20 border rounded px-1"
                  value={person.bill_rate}
                  onChange={(e) => updatePerson(person.person_id, 'bill_rate', e.target.value)}
                />
                <button className="text-red-600">×</button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Child orgs */}
        {node.children?.map(child => renderOrgNode(child, depth + 1))}
      </div>
    );
  }
}