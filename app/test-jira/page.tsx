"use client";

import { useState } from "react";
import { 
  getProjects, 
  getUsers, 
  getStatuses, 
  createIssue 
} from "@/actions/jira";

export default function TestJiraPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAction = async (name: string, action: () => Promise<any>) => {
    setLoading(true);
    setResult({ action: name, status: "running..." });
    const res = await action();
    setResult({ action: name, ...res });
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Jira Actions Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => runAction("getProjects", getProjects)}
          className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          disabled={loading}
        >
          Get Projects
        </button>
        <button 
          onClick={() => runAction("getUsers", getUsers)}
          className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          disabled={loading}
        >
          Get Users
        </button>
        <button 
          onClick={() => runAction("getStatuses", getStatuses)}
          className="p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          disabled={loading}
        >
          Get Statuses
        </button>
        <button 
          onClick={() => runAction("createIssue (stub)", () => createIssue({
            fields: {
               project: { key: "TEST" },
               summary: "Test issue from Next.js",
               issuetype: { name: "Task" }
            }
          }))}
          className="p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
          disabled={loading}
        >
          Test Create Issue
        </button>
      </div>

      {result && (
        <div className="p-6 bg-slate-900 text-slate-100 rounded-xl overflow-auto border border-slate-700 shadow-2xl">
          <h2 className="text-sm font-mono text-slate-400 mb-2 uppercase tracking-wider">
            Result for: {result.action}
          </h2>
          <pre className="text-xs leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> These actions will return <code>401 Unauthorized</code> or <code>404 Not Found</code> 
          until you successfully log in with Atlassian and configured valid credentials in <code>.env.local</code>.
        </p>
      </div>
    </div>
  );
}
