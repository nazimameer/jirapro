"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeWrapper from "@/components/ThemeWrapper";
import { setSelectedSite } from "@/actions/auth";

interface SelectSiteClientProps {
  resources: any[];
}

export default function SelectSiteClient({ resources }: SelectSiteClientProps) {
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);
  const router = useRouter();

  async function handleSelect(cloudId: string) {
    setSelecting(cloudId);
    const result = await setSelectedSite(cloudId);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to select site");
      setSelecting(null);
    }
  }

  return (
    <ThemeWrapper>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
              Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Workspace</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              We found multiple Jira sites associated with your account.
            </p>
          </div>

          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center mb-6">
                <p className="text-red-400 font-bold mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="text-white bg-red-500 px-6 py-2 rounded-xl font-bold">Retry</button>
              </div>
            )}
            
            {resources.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSelect(site.id)}
                disabled={!!selecting}
                className={`group relative flex items-center gap-6 p-8 rounded-[2.5rem] border transition-all duration-500 text-left ${
                  selecting === site.id 
                    ? "bg-indigo-500/20 border-indigo-500 ring-4 ring-indigo-500/10" 
                    : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02]"
                }`}
              >
                <div className="relative">
                  <img 
                    src={site.avatarUrl || "https://w7.pngwing.com/pngs/423/84/png-transparent-jira-atlassian-project-management-software-development-blue-organization-atlassian-thumbnail.png"} 
                    alt={site.name}
                    className="w-16 h-16 rounded-2xl shadow-2xl transition-transform group-hover:rotate-6"
                  />
                  {selecting === site.id && (
                    <div className="absolute inset-0 bg-indigo-500/60 rounded-2xl flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{site.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{site.url}</p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-12 text-center text-slate-500 text-sm animate-in fade-in duration-1000 delay-500">
            Don&apos;t see your site? Make sure you have the correct permissions in Atlassian.
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
