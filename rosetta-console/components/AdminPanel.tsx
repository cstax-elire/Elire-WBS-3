"use client";

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">System Administration</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium">Database Status</h3>
            <p className="text-sm text-gray-600">Connected to PostgreSQL</p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium">Data Sync</h3>
            <p className="text-sm text-gray-600">Last sync: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-medium">System Health</h3>
            <p className="text-sm text-gray-600">All systems operational</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded text-sm">
            Export Data
          </button>
          <button className="p-3 bg-green-50 hover:bg-green-100 rounded text-sm">
            Sync Systems
          </button>
          <button className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded text-sm">
            Clear Cache
          </button>
          <button className="p-3 bg-red-50 hover:bg-red-100 rounded text-sm">
            View Logs
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Configuration</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Auto-save</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Real-time sync</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Audit logging</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}