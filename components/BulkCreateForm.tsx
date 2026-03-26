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
    <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-8 duration-300 ${
      type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {type === 'success' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </div>
      <span className="font-bold text-sm tracking-tight">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, count }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, title: string, message: string, count: number }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 text-center mb-2">{title}</h3>
        <p className="text-slate-500 text-center mb-8 leading-relaxed">{message}</p>
        <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-between border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planned Issues</span>
          <span className="text-xl font-black text-indigo-600">{count}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onCancel} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all font-bold">
            Wait, Go Back
          </button>
          <button onClick={onConfirm} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-bold">
            Yes, Apply Now
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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md hover:border-indigo-300 transition-all duration-300">
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button 
          type="button"
          onClick={() => onDuplicate(index)}
          className="text-slate-300 hover:text-indigo-600 p-1 hover:bg-indigo-50 rounded-lg transition-colors"
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
          className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            <span className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 text-xs flex items-center justify-center font-black border border-slate-100">
              {index + 1}
            </span>
          </div>
          <div className="flex-1">
             <input 
              type="text"
              ref={inputRef}
              value={task.summary}
              onChange={(e) => onUpdate(index, "summary", e.target.value)}
              placeholder="Task summary..."
              className="w-full text-lg font-bold text-slate-800 placeholder:text-slate-300 border-b-2 border-transparent focus:border-indigo-500 outline-none transition-all pb-1 bg-transparent"
              required
            />
          </div>
        </div>
        <div className="pl-12">
          <textarea 
            value={task.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="Describe the work in detail (optional)..."
            className="w-full p-4 text-sm text-slate-600 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none h-24 transition-all resize-none shadow-sm"
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2 w-full md:auto">
          <select 
            value={selectedTemplateId}
            onChange={handleLoadTemplate}
            className="flex-1 md:w-64 p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          >
            <option value="">-- Load a Template --</option>
            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          {selectedTemplateId && (
            <button 
              onClick={handleDeleteTemplate}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
              title="Delete template"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button 
            onClick={() => setShowBulkPaste(!showBulkPaste)}
            className="whitespace-nowrap flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-semibold"
          >
            {showBulkPaste ? "Hide Paste Area" : "Bulk Paste"}
          </button>
          <button 
            onClick={clearTasks}
            className="whitespace-nowrap flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold"
          >
            Clear Tasks
          </button>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Project Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Project</label>
            <select 
              value={commonFields.project}
              onChange={(e) => setCommonFields({...commonFields, project: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800"
              required
            >
              {projects.map(p => <option key={p.id} value={p.key}>{p.name} ({p.key})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Type</label>
            <select 
              value={commonFields.issueType}
              onChange={(e) => setCommonFields({...commonFields, issueType: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800"
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Default Assignee</label>
            <select 
              value={commonFields.assignee}
              onChange={(e) => setCommonFields({...commonFields, assignee: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800"
            >
              <option value="">Unassigned</option>
              {users.filter(u => u.accountType === "atlassian").map(u => (
                <option key={u.accountId} value={u.accountId}>{u.displayName}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">After Create: Target Status</label>
            <select 
              value={commonFields.targetStatus}
              onChange={(e) => setCommonFields({...commonFields, targetStatus: e.target.value})}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800"
            >
              <option value="">Keep Default</option>
              {Array.from(new Set(availableStatuses.map(s => s.name))).map(name => (
                <option key={name as string} value={name as string}>{name as string}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="w-full sm:w-auto flex-1 max-w-sm">
              <input 
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={selectedTemplateId ? "Update template name..." : "New template name..."}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate || (!newTemplateName.trim() && !selectedTemplateId)}
              className="w-full sm:w-auto px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-semibold text-sm disabled:bg-slate-300 shadow-sm"
            >
              {selectedTemplateId ? "Overwrite Template" : "Save as Template"}
            </button>
        </div>
      </div>

      {showBulkPaste && (
        <div className="bg-white p-6 rounded-xl border-2 border-dashed border-indigo-200 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Quick-Import Tasks</h3>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase tracking-tighter font-black">Power User Feature</span>
          </div>
          <p className="text-xs text-slate-500 mb-3 font-medium">Format: "Summary" or "Summary, Description" (Comma, Tab, or Semicolon supported)</p>
          <textarea 
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Implement Auth System&#10;Fix sidebar bug, Sidebar overlaps on mobile&#10;Write docs, User guide for bulk tasks"
            className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs shadow-inner leading-relaxed"
          />
          <div className="flex justify-end mt-4 gap-3">
            <button 
              onClick={() => setShowBulkPaste(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800"
            >
              Discard
            </button>
            <button 
              onClick={handleBulkPaste}
              className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 font-bold text-sm transition-all active:scale-95"
            >
              Parse & Append Rows
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between px-2">
          Queued Tasks
          <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-widest">{tasks.length} {tasks.length === 1 ? 'Entry' : 'Entries'}</span>
        </h2>
        
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
        
        <button 
          type="button"
          onClick={addTask}
          className="w-full py-6 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-bold flex items-center justify-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-300 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          Add One More Task
        </button>
      </div>

      <div className="pt-12 flex flex-col items-center border-t border-slate-100">
        {loading && progress.total > 0 && (
          <div className="w-full max-w-md mb-8 space-y-3">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-indigo-600">
              <span>Applying Jira Magic...</span>
              <span>{progress.current} / {progress.total} Created</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
               <div 
                className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
               />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 px-5 py-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-4 animate-shake shadow-sm font-medium">
             <div className="bg-red-500 text-white p-1 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             </div>
             {error}
          </div>
        )}
        {success && (
          <div className="mb-8 px-5 py-4 bg-green-50 text-green-700 rounded-2xl border border-green-200 flex items-center gap-4 animate-bounce-subtle shadow-sm font-medium">
             <div className="bg-green-500 text-white p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
             </div>
             {success}
          </div>
        )}
        
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={loading || tasks.filter(t => t.summary.trim()).length === 0}
          className="px-16 py-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 font-black text-xl disabled:bg-slate-300 disabled:shadow-none min-w-[300px] active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
