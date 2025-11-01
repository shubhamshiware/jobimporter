import { useState, useEffect } from "react";
import ImportTable from "../components/ImportTable";
import { api } from "../lib/api";

export default function Home() {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/imports");
      setImports(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch import logs");
      console.error("Error fetching imports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerImport = async () => {
    try {
      setTriggering(true);
      await api.post("/imports/trigger");
      alert("Import triggered successfully! Refreshing data...");
      await fetchImports();
    } catch (err) {
      alert("Failed to trigger import");
      console.error("Error triggering import:", err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Import History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage job import operations
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleTriggerImport}
              disabled={triggering}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {triggering ? "Triggering..." : "Trigger Import"}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading import logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchImports}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <ImportTable imports={imports} onRefresh={fetchImports} />
          )}
        </div>
      </div>
    </div>
  );
}
