"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { createSingleIssue } from "@/actions/jira";
import { saveTemplate, deleteTemplate } from "@/actions/templates";
import { useRouter } from "next/navigation";

// --- Sub-components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border animate-in slide-in-from-right-8 duration-300 backdrop-blur-xl ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
    }`}>
      <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}>
        {type === 'success' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </div>
      <span className="font-black text-sm tracking-tight">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/30 hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, count }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, title: string, message: string, count: number }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111112] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-md w-full p-10 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
        
        <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-indigo-500/20 ring-4 ring-indigo-500/5 transition-transform hover:scale-110">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        
        <h3 className="text-3xl font-black text-white text-center mb-3 leading-tight tracking-tight">{title}</h3>
        <p className="text-slate-400 text-center mb-10 leading-relaxed font-medium">{message}</p>
        
        <div className="bg-white/5 rounded-3xl p-6 mb-10 flex items-center justify-between border border-white/5 backdrop-blur-sm">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Planned Issues</span>
          <span className="text-3xl font-black text-white drop-shadow-glow">{count}</span>
        </div>
        
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full px-8 py-5 bg-white text-black rounded-2xl hover:bg-slate-200 transition-all font-black text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95">
            Yes, Apply Now
          </button>
          <button onClick={onCancel} className="w-full px-8 py-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-black text-sm uppercase tracking-widest active:scale-95">
            Cancel Process
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoized individual task row to prevent unnecessary re-renders
const TaskRow = memo(({ 
  task, 
  index, 
  onUpdate, 
  onRemove,
  onDuplicate,
  inputRef 
}: { 
  task: { summary: string, description: string }, 
  index: number, 
  onUpdate: (index: number, field: string, value: string) => void,
  onRemove: (index: number) => void,
  onDuplicate: (index: number) => void,
  inputRef: (el: HTMLInputElement | null) => void
}) => {
  return (
    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md relative group hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.05)]">
      <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          type="button"
          onClick={() => onDuplicate(index)}
          className="text-slate-500 hover:text-indigo-400 p-2 hover:bg-white/5 rounded-xl transition-all"
          title="Duplicate task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H7a2 2 0 00-2 2v6H5a2 2 0 01-2-2V5z" />
          </svg>
        </button>
        <button 
          type="button"
          onClick={() => onRemove(index)}
          className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-xl transition-all"
          title="Remove task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="shrink-0">
            <span className="w-10 h-10 rounded-2xl bg-white/5 text-indigo-400 text-xs flex items-center justify-center font-black border border-white/5 shadow-inner">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1">
             <input 
              type="text"
              ref={inputRef}
              value={task.summary}
              onChange={(e) => onUpdate(index, "summary", e.target.value)}
              placeholder="Task summary..."
              className="w-full text-xl font-black text-white placeholder:text-slate-600 border-b-2 border-transparent focus:border-indigo-500 outline-none transition-all pb-1 bg-transparent"
              required
            />
          </div>
        </div>
        <div className="pl-15">
          <textarea 
            value={task.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="Describe the mission details (optional)..."
            className="w-full p-5 text-sm font-medium text-slate-400 bg-white/5 border border-white/5 rounded-2xl focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/10 outline-none h-28 transition-all resize-none shadow-inner"
          />
        </div>
      </div>
    </div>
  );
});

TaskRow.displayName = "TaskRow";

interface BulkCreateFormProps {
  projects: any[];
  users: any[];
  statuses: any[];
  initialTemplates: any[];
}

export default function BulkCreateForm({ projects, users, statuses, initialTemplates }: BulkCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const [commonFields, setCommonFields] = useState({
    project: projects[0]?.key || "",
    assignee: "",
    issueType: "Task",
    targetStatus: ""
  });

  const [tasks, setTasks] = useState([
    { summary: "", description: "" }
  ]);

  const [availableStatuses, setAvailableStatuses] = useState<any[]>([]);

  // Filter statuses based on selected project
  useEffect(() => {
    if (commonFields.project) {
      setAvailableStatuses(statuses);
    }
  }, [commonFields.project, statuses]);

  const taskRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (tasks.length > 1 && taskRefs.current[tasks.length - 1]) {
      taskRefs.current[tasks.length - 1]?.focus();
    }
  }, [tasks.length]);

  const addTask = useCallback(() => {
    setTasks(prev => [...prev, { summary: "", description: "" }]);
  }, []);

  const removeTask = useCallback((index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const duplicateTask = useCallback((index: number) => {
    setTasks(prev => {
      const taskToCopy = prev[index];
      const newTasks = [...prev];
      newTasks.splice(index + 1, 0, { ...taskToCopy });
      return newTasks;
    });
  }, []);

  const clearTasks = useCallback(() => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      setTasks([{ summary: "", description: "" }]);
      setBulkInput("");
      setSelectedTemplateId("");
      setToast({ message: "Cleared all tasks", type: "success" });
    }
  }, []);

  const updateTask = useCallback((index: number, field: string, value: string) => {
    setTasks(prev => {
      const newTasks = [...prev];
      (newTasks[index] as any)[field] = value;
      return newTasks;
    });
  }, []);

  const handleLoadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    if (!id) return;

    const template = templates.find(t => t._id === id);
    if (template) {
      setCommonFields({
        project: template.projectKey,
        assignee: template.assigneeId || "",
        issueType: template.issueType,
        targetStatus: template.targetStatus || ""
      });
      setTasks(template.tasks.map((t: any) => ({ 
        summary: t.summary, 
        description: t.description || "" 
      })));
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    setIsSavingTemplate(true);
    const validTasks = tasks.filter(t => t.summary.trim());
    
    const result = await saveTemplate({
      name: newTemplateName,
      templateId: selectedTemplateId || undefined,
      projectKey: commonFields.project,
      issueType: commonFields.issueType,
      assigneeId: commonFields.assignee,
      targetStatus: commonFields.targetStatus,
      tasks: validTasks
    });

    if (result.error) {
      alert(result.error.message);
    } else {
      if (selectedTemplateId) {
        setTemplates(templates.map(t => t._id === selectedTemplateId ? result.data : t));
      } else {
        setTemplates([result.data, ...templates]);
      }
      setNewTemplateName("");
      setIsSavingTemplate(false);
      alert("Template saved successfully!");
    }
    setIsSavingTemplate(false);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return;
    if (!confirm("Delete this template?")) return;

    const result = await deleteTemplate(selectedTemplateId);
    if (result.error) {
      alert(result.error.message);
    } else {
      setTemplates(templates.filter(t => t._id !== selectedTemplateId));
      setSelectedTemplateId("");
      alert("Template deleted");
    }
  };

  const handleBulkPaste = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split(/\r?\n/).filter(line => line.trim());
    const newTasksFromPaste = lines.map(line => {
      let summary = line;
      let description = "";
      const delimiters = [",", "\t", ";"];
      for (const delimiter of delimiters) {
        if (line.includes(delimiter)) {
          const parts = line.split(delimiter);
          summary = parts[0].trim();
          description = parts.slice(1).join(delimiter).trim();
          break;
        }
      }
      return { summary: summary.substring(0, 255), description };
    });
    const existingFiltered = tasks.filter(t => t.summary.trim() || t.description.trim());
    setTasks([...existingFiltered, ...newTasksFromPaste]);
    setBulkInput("");
    setShowBulkPaste(false);
  };

  const handleSubmit = async () => {
    const validTasks = tasks.filter(t => t.summary.trim());
    if (validTasks.length === 0) {
      setToast({ message: "Please add at least one task", type: "error" });
      return;
    }

    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setSuccess(null);
    setProgress({ current: 0, total: validTasks.length });

    const results = [];
    let successCount = 0;

    for (let i = 0; i < validTasks.length; i++) {
      const task = validTasks[i];
      const payload = {
        fields: {
          project: { key: commonFields.project },
          summary: task.summary.trim(),
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: task.description.trim() || "No description provided." }]
              }
            ]
          },
          issuetype: { name: commonFields.issueType },
          ...(commonFields.assignee ? { assignee: { accountId: commonFields.assignee } } : {})
        }
      };

      const result = await createSingleIssue(payload, commonFields.targetStatus);
      
      if (result.error) {
        console.error(`Failed at task ${i + 1}:`, result.error);
        // We'll continue with others but track the error
      } else {
        successCount++;
      }
      
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    if (successCount === validTasks.length) {
      setSuccess(`Successfully created all ${validTasks.length} tasks!`);
      setToast({ message: `Successfully created ${validTasks.length} tasks!`, type: "success" });
      setTasks([{ summary: "", description: "" }]);
    } else if (successCount > 0) {
      setSuccess(`Created ${successCount} tasks, but ${validTasks.length - successCount} failed.`);
      setToast({ message: `Partial success: ${successCount}/${validTasks.length} created`, type: "error" });
    } else {
      setError("Failed to create any issues. Please check your Jira permissions.");
      setToast({ message: "Bulk creation failed", type: "error" });
    }
    
    setLoading(false);
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="space-y-8">
      {/* Template & Global Actions Section */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <select 
              value={selectedTemplateId}
              onChange={handleLoadTemplate}
              className="w-full pl-5 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-white/10"
            >
              <option value="" className="bg-[#0A0A0B]">-- Load Workspace Template --</option>
              {templates.map(t => <option key={t._id} value={t._id} className="bg-[#0A0A0B]">{t.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-indigo-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          
          {selectedTemplateId && (
            <button 
              onClick={handleDeleteTemplate}
              className="p-3.5 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all border border-transparent hover:border-red-400/20 active:scale-95"
              title="Delete template"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setShowBulkPaste(!showBulkPaste)}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all text-sm font-black tracking-tight active:scale-95 ${
              showBulkPaste 
                ? "bg-fuchsia-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.3)]" 
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {showBulkPaste ? "Hide Editor" : "Import from CSV/Text"}
          </button>
          <button 
            onClick={clearTasks}
            className="whitespace-nowrap flex items-center gap-2 px-6 py-3.5 bg-white/5 text-slate-400 border border-white/5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all text-sm font-black tracking-tight active:scale-95"
          >
            Reset Workspace
          </button>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-50" />
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Global Mission Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Target Project</label>
            <div className="relative group/select">
              <select 
                value={commonFields.project}
                onChange={(e) => setCommonFields({...commonFields, project: e.target.value})}
                className="w-full pl-5 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer hover:bg-white/10"
                required
              >
                {projects.map(p => <option key={p.id} value={p.key} className="bg-[#0A0A0B]">{p.name} ({p.key})</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/select:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Issue Type</label>
            <div className="relative group/select">
              <select 
                value={commonFields.issueType}
                onChange={(e) => setCommonFields({...commonFields, issueType: e.target.value})}
                className="w-full pl-5 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer hover:bg-white/10"
              >
                <option value="Task" className="bg-[#0A0A0B]">Task</option>
                <option value="Bug" className="bg-[#0A0A0B]">Bug</option>
                <option value="Story" className="bg-[#0A0A0B]">Story</option>
                <option value="Epic" className="bg-[#0A0A0B]">Epic</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/select:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Auto-Assign To</label>
            <div className="relative group/select">
              <select 
                value={commonFields.assignee}
                onChange={(e) => setCommonFields({...commonFields, assignee: e.target.value})}
                className="w-full pl-5 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer hover:bg-white/10"
              >
                <option value="" className="bg-[#0A0A0B]">Unassigned</option>
                {users.map(u => <option key={u.accountId} value={u.accountId} className="bg-[#0A0A0B]">{u.displayName}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/select:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Auto-Transition To</label>
            <div className="relative group/select">
              <select 
                value={commonFields.targetStatus}
                onChange={(e) => setCommonFields({...commonFields, targetStatus: e.target.value})}
                className="w-full pl-5 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer hover:bg-white/10"
              >
                <option value="" className="bg-[#0A0A0B]">No Transition</option>
                {Array.from(new Set(availableStatuses.map(s => s.name))).map((name: any) => (
                  <option key={name} value={name} className="bg-[#0A0A0B]">{name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover/select:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="w-full sm:w-auto flex-1 max-w-sm">
              <input 
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={selectedTemplateId ? "Update template name..." : "Save as new template..."}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <button 
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate || (!newTemplateName.trim() && !selectedTemplateId)}
              className="w-full sm:w-auto px-8 py-3 bg-white/5 text-slate-400 border border-white/5 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {selectedTemplateId ? "Update Blueprint" : "Save Workspace"}
            </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
            Active Task Queue
          </h2>
          <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] backdrop-blur-md">
            {tasks.length} {tasks.length === 1 ? 'Object' : 'Objects'} Detected
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task, index) => (
            <TaskRow 
              key={index}
              task={task}
              index={index}
              onUpdate={updateTask}
              onRemove={removeTask}
              onDuplicate={duplicateTask}
              inputRef={el => { taskRefs.current[index] = el; }}
            />
          ))}
        </div>
        
        <button 
          type="button"
          onClick={addTask}
          className="w-full py-10 border-2 border-dashed border-white/5 text-slate-500 rounded-[2.5rem] hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all font-black flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/30 transition-all shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="uppercase tracking-[0.3em] text-[10px]">Initialize New Task Object</span>
        </button>
      </div>

      <div className="pt-20 flex flex-col items-center">
        {loading && progress.total > 0 && (
          <div className="w-full max-w-lg mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Synchronizing with Jira...
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {progress.current} / {progress.total} Injected
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
               <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-gradient-x"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
               />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-10 px-8 py-5 bg-red-500/10 text-red-400 rounded-3xl border border-red-500/20 flex items-center gap-5 animate-shake backdrop-blur-md font-bold">
             <div className="bg-red-500 text-white p-1.5 rounded-xl shadow-lg shadow-red-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             </div>
             {error}
          </div>
        )}
        
        {success && (
          <div className="mb-10 px-8 py-5 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/20 flex items-center gap-5 animate-in fade-in slide-in-from-top-4 backdrop-blur-md font-bold">
             <div className="bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
             </div>
             {success}
          </div>
        )}
        
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={loading || tasks.filter(t => t.summary.trim()).length === 0}
          className="relative group p-[2px] rounded-[2rem] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 rounded-[2rem] opacity-70 blur-md group-hover:opacity-100 transition-opacity animate-gradient-x" />
          <div className="relative px-20 py-6 bg-black rounded-[2rem] flex items-center justify-center gap-4 border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            {loading ? (
              <span className="flex items-center gap-3 text-white font-black text-xl uppercase tracking-widest">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
            <span className="flex items-center gap-3">
              Apply {tasks.filter(t => t.summary.trim()).length} Issues
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            )}
          </div>
        </button>
        <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Jira Pro Smart Workflow Engine</p>
      </div>

      {/* Overlays */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
        title="Confirm Bulk Action"
        message={`You are about to create ${tasks.filter(t => t.summary.trim()).length} new issues in project ${commonFields.project}. This action will be processed individually and may take a moment.`}
        count={tasks.filter(t => t.summary.trim()).length}
      />
    </div>
  );
}
