import Link from "next/link";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

export default function ImportTable({ imports, onRefresh }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-800 bg-green-100";
      case "failed":
        return "text-red-800 bg-red-100";
      case "processing":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFeedName = (feedUrl) => {
    try {
      const url = new URL(feedUrl);
      const path = url.pathname + url.search;
      return path.length > 50 ? path.substring(0, 47) + "..." : path;
    } catch {
      return feedUrl.length > 50 ? feedUrl.substring(0, 47) + "..." : feedUrl;
    }
  };

  if (!imports || imports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No import logs found</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Import Logs
        </h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Feed URL
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Import Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                New
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Updated
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Failed
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {imports.map((importLog) => (
              <tr key={importLog._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm text-gray-900 max-w-xs truncate"
                    title={importLog.feedUrl}
                  >
                    {getFeedName(importLog.feedUrl)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(importLog.importDateTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {importLog.totalFetched}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="text-green-600 font-semibold">
                    {importLog.newJobs}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="text-blue-600 font-semibold">
                    {importLog.updatedJobs}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="text-red-600 font-semibold">
                    {importLog.failedJobs}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      importLog.status
                    )}`}
                  >
                    {getStatusIcon(importLog.status)}
                    <span className="ml-1 capitalize">{importLog.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/imports/${importLog._id}`}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {imports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No import logs available</p>
        </div>
      )}
    </div>
  );
}
