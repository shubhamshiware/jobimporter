import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { api } from "../../lib/api";

export default function ImportDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [importLog, setImportLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchImportDetail();
    }
  }, [id]);

  const fetchImportDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/imports/${id}`);
      setImportLog(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch import details");
      console.error("Error fetching import detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Import History
          </Link>
        </div>
      </div>
    );
  }

  if (!importLog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Import log not found</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Import History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Import History
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Import Details
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  importLog.status
                )}`}
              >
                {getStatusIcon(importLog.status)}
                <span className="ml-1 capitalize">{importLog.status}</span>
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Feed URL</dt>
                <dd className="mt-1 text-sm text-gray-900 break-all">
                  {importLog.feedUrl}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Import Date & Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(importLog.importDateTime).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Fetched
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {importLog.totalFetched}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Imported
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {importLog.totalImported}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">New Jobs</dt>
                <dd className="mt-1 text-sm text-green-600 font-semibold">
                  {importLog.newJobs}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Updated Jobs
                </dt>
                <dd className="mt-1 text-sm text-blue-600 font-semibold">
                  {importLog.updatedJobs}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Failed Jobs
                </dt>
                <dd className="mt-1 text-sm text-red-600 font-semibold">
                  {importLog.failedJobs}
                </dd>
              </div>
            </dl>

            {importLog.failures && importLog.failures.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Failures
                </h4>
                <div className="space-y-4">
                  {importLog.failures.map((failure, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-md p-4"
                    >
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-red-800">
                            Job Key: {failure.jobKey}
                          </h5>
                          <p className="mt-1 text-sm text-red-700">
                            {failure.reason}
                          </p>
                          <p className="mt-2 text-xs text-red-600">
                            {new Date(failure.ts).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
