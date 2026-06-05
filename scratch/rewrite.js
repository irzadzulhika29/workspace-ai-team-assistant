const fs = require('fs');
let content = fs.readFileSync('fe/src/pages/JiraPage.jsx', 'utf8');

content = content.replace(
  'import React, { useCallback, useEffect, useMemo, useState } from "react";',
  'import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";'
);

if (!content.includes('Modal, toast')) {
  content = content.replace(
    'import { Button, Input } from "@/components/ui";',
    'import { Alert, Button, Input, Modal, toast } from "@/components/ui";'
  );
}

content = content.replace(
  /import \{\s*AlertCircle,\s*Bug,\s*CalendarDays,\s*ChevronRight,/,
  'import {\n  AlertCircle,\n  Bug,\n  CalendarDays,\n  Check,\n  ChevronDown,\n  ChevronRight,\n  ChevronUp,'
);

const helpers = `
const PRIORITY_OPTIONS = [
  { value: "", label: "Tanpa prioritas" },
  { value: "Highest", label: "Highest" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "Lowest", label: "Lowest" },
];

const createDefaultIssueForm = () => ({
  projectKey: "",
  issueTypeId: "",
  issueTypeName: "",
  summary: "",
  description: "",
  priority: "",
  assignee: "",
  dueDate: "",
  labels: "",
});

const validateIssueForm = (form) => {
  if (!form.projectKey) return "Pilih project Jira terlebih dahulu.";
  if (!form.issueTypeId) return "Pilih issue type terlebih dahulu.";
  if (!form.summary.trim()) return "Judul issue wajib diisi.";
  return "";
};

const buildAtlassianDocument = (value) => {
  const text = String(value || "").trim();
  if (!text) return undefined;

  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
};

const buildCreateIssuePayload = (form) => {
  const fields = {
    project: { key: form.projectKey },
    issuetype: { id: form.issueTypeId },
    summary: form.summary.trim(),
  };

  const description = buildAtlassianDocument(form.description);
  if (description) fields.description = description;

  if (form.priority) {
    fields.priority = { name: form.priority };
  }

  if (form.assignee.trim()) {
    fields.assignee = { accountId: form.assignee.trim() };
  }

  if (form.dueDate) {
    fields.duedate = form.dueDate;
  }

  const labels = form.labels
    .split(/[\\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (labels.length) fields.labels = labels;

  return { fields };
};
`;

if (!content.includes('PRIORITY_OPTIONS')) {
  content = content.replace(
    'const JIRA_CACHE_KEY',
    helpers + '\nconst JIRA_CACHE_KEY'
  );
}

const newHeaderSection = `const JiraHeaderSection = ({ loading, onSync, onCompose, searchQuery, onSearchChange }) => (
  <section>
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
            <FaTasks className="h-10 w-10" />
          </div>
          <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
            Jira Workspace
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Kelola dan pantau semua issue Jira Anda dalam satu tempat.
        </p>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="w-full max-w-[540px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari issue atau project..."
            className="h-auto w-full rounded-2xl bg-white px-4 py-4 pl-14 pr-16 text-sm text-slate-700 placeholder:text-slate-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
            Ctrl K
          </span>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <Button
          onClick={onSync}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2 rounded-2xl text-sm"
        >
          <RefreshCw className={\`h-4 w-4 \${loading ? "animate-spin" : ""}\`} />
          <span>Refresh</span>
        </Button>

        <Button
          onClick={onCompose}
          size="sm"
          className="gap-2 rounded-2xl bg-[#ff623d] text-sm text-white hover:bg-[#ff744f]"
        >
          <SquarePen className="h-4 w-4" />
          <span>Compose</span>
        </Button>
      </div>
    </div>
  </section>
);`;

content = content.replace(/const JiraHeaderSection = [\s\S]*?<\/section>\r?\n\);\s*/, newHeaderSection + '\n');

const customSelectAndModal = `
const CustomSelect = ({ value, onChange, options, placeholder, disabled, loadingText, emptyText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  let displayText = placeholder || "Pilih opsi";
  if (disabled && loadingText) {
    displayText = loadingText;
  } else if (!disabled && options.length === 0 && emptyText) {
    displayText = emptyText;
  } else if (selectedOption) {
    displayText = selectedOption.label;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={\`flex h-11 w-full items-center justify-between rounded-2xl border px-4 text-sm transition-all focus:outline-none focus:ring-2 \${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
            : isOpen
              ? "border-[#ff623d] bg-white text-slate-700 ring-[#ff623d]/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:border-[#ff623d] focus:ring-[#ff623d]/20"
        }\`}
      >
        <span className="truncate">{displayText}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-200/50 outline-none animate-in fade-in zoom-in-95">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">{emptyText || "Tidak ada opsi tersedia"}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={\`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors \${
                  value === option.value
                    ? "bg-[#fff0eb] font-medium text-[#d85a32]"
                    : "text-slate-700 hover:bg-slate-50"
                }\`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CreateIssueModal = ({
  open,
  form,
  error,
  submitting,
  projects,
  loadingProjects,
  projectsError,
  issueTypes,
  loadingIssueTypes,
  onClose,
  onChange,
  onSubmit,
  onRetryProjects,
  onRetryIssueTypes,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="lg"
    className="rounded-[28px]"
  >
    <Modal.Header onClose={onClose} className="pb-3">
      <div>
        <Modal.Title className="text-xl">Buat issue Jira</Modal.Title>
        <p className="mt-1 text-xs text-slate-500">
          Tambahkan tiket baru langsung ke project Jira kamu.
        </p>
      </div>
    </Modal.Header>

    <Modal.Body className="max-h-[70vh] overflow-y-auto pb-2">
      <div className="space-y-4">
        {error ? (
          <Alert variant="error" title="Issue belum bisa dibuat">
            {error}
          </Alert>
        ) : null}

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Project & tipe</h3>
            <p className="mt-1 text-xs text-slate-500">
              Pilih project Jira dan tipe issue yang akan dibuat.
            </p>
          </div>

          {projectsError ? (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span className="flex-1">{projectsError}</span>
              <button
                type="button"
                onClick={onRetryProjects}
                className="font-semibold text-rose-700 underline-offset-2 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project
              </label>
              <CustomSelect
                value={form.projectKey}
                onChange={(val) => onChange("projectKey", val)}
                disabled={loadingProjects}
                placeholder="Pilih project"
                loadingText="Memuat project..."
                options={projects.map((p) => ({ value: p.key, label: \`\${p.key} — \${p.name}\` }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Issue type
              </label>
              <CustomSelect
                value={form.issueTypeId}
                onChange={(val) => onChange("issueTypeId", val)}
                disabled={!form.projectKey || loadingIssueTypes}
                placeholder={!form.projectKey ? "Pilih project dulu" : "Pilih issue type"}
                loadingText="Memuat issue type..."
                emptyText="Tidak ada issue type"
                options={issueTypes.map((t) => ({ value: t.id, label: t.name }))}
              />
              {form.projectKey && !loadingIssueTypes && issueTypes.length === 0 ? (
                <button
                  type="button"
                  onClick={onRetryIssueTypes}
                  className="mt-1 text-xs font-semibold text-[#ff623d] underline-offset-2 hover:underline"
                >
                  Muat ulang issue type
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Judul issue
            </label>
            <Input
              value={form.summary}
              onChange={(event) => onChange("summary", event.target.value)}
              placeholder="Tuliskan judul issue secara singkat"
              className="rounded-2xl"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Detail tambahan</h3>
            <p className="mt-1 text-xs text-slate-500">
              Atur prioritas, assignee, due date, dan label opsional.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prioritas
              </label>
              <CustomSelect
                value={form.priority}
                onChange={(val) => onChange("priority", val)}
                placeholder="Pilih prioritas"
                options={PRIORITY_OPTIONS}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Due date
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(event) => onChange("dueDate", event.target.value)}
                className="h-11 rounded-2xl bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assignee account ID
              </label>
              <Input
                value={form.assignee}
                onChange={(event) => onChange("assignee", event.target.value)}
                placeholder="opsional, contoh: 5f8b..."
                className="rounded-2xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Labels
              </label>
              <Input
                value={form.labels}
                onChange={(event) => onChange("labels", event.target.value)}
                placeholder="Pisahkan dengan koma, contoh: bug, urgent"
                className="rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Deskripsi</h3>
            <p className="mt-1 text-xs text-slate-500">
              Jelaskan konteks, langkah reproduksi, atau ekspektasi hasil.
            </p>
          </div>

          <textarea
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="Tulis deskripsi issue..."
            rows={5}
            className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-all duration-150 placeholder:text-slate-400 focus:border-[#ff623d] focus:outline-none focus:ring-2 focus:ring-[#ff623d]/20"
          />
        </section>
      </div>
    </Modal.Body>

    <Modal.Footer>
      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={onClose}
        disabled={submitting}
      >
        Batal
      </Button>
      <Button
        type="button"
        className="rounded-2xl bg-[#ff623d] text-white hover:bg-[#ff744f]"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? "Membuat..." : "Buat issue"}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default function JiraPage() {
`;

content = content.replace(/export default function JiraPage\(\) \{\r?\n/, customSelectAndModal);

const jiraPageLogic = `
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState(createDefaultIssueForm());
  const [composeError, setComposeError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  
  const [issueTypes, setIssueTypes] = useState([]);
  const [loadingIssueTypes, setLoadingIssueTypes] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setProjectsError("");
    try {
      const data = await jiraApi.fetchProjects();
      setProjects(data);
    } catch (err) {
      setProjectsError(err.message || "Gagal memuat project");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadIssueTypes = useCallback(async (projectKey) => {
    if (!projectKey) {
      setIssueTypes([]);
      return;
    }
    setLoadingIssueTypes(true);
    try {
      const data = await jiraApi.fetchIssueTypes(projectKey);
      setIssueTypes(data);
    } catch (err) {
      setIssueTypes([]);
    } finally {
      setLoadingIssueTypes(false);
    }
  }, []);

  const handleComposeOpen = () => {
    setComposeOpen(true);
    setComposeForm(createDefaultIssueForm());
    setComposeError("");
    if (projects.length === 0) {
      loadProjects();
    }
  };

  const handleComposeChange = (field, value) => {
    setComposeForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "projectKey" && prev.projectKey !== value) {
        next.issueTypeId = "";
        next.issueTypeName = "";
        if (value) loadIssueTypes(value);
        else setIssueTypes([]);
      }
      return next;
    });
  };

  const handleComposeSubmit = async () => {
    const errorMsg = validateIssueForm(composeForm);
    if (errorMsg) {
      setComposeError(errorMsg);
      return;
    }
    setSubmitting(true);
    setComposeError("");
    try {
      const payload = buildCreateIssuePayload(composeForm);
      await jiraApi.createIssue(payload);
      toast.success("Issue Jira berhasil dibuat!");
      setComposeOpen(false);
      loadIssues();
    } catch (err) {
      setComposeError(err.message || "Gagal membuat issue.");
    } finally {
      setSubmitting(false);
    }
  };
`;

content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);\r?\n/,
  `const [searchQuery, setSearchQuery] = useState("");\n` + jiraPageLogic
);

content = content.replace(
  /<JiraHeaderSection[\s\S]*?\/>/,
  `<JiraHeaderSection
          loading={loading}
          onSync={handleRefreshAll}
          onCompose={handleComposeOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />`
);

const modalRender = `
      <CreateIssueModal
        open={composeOpen}
        form={composeForm}
        error={composeError}
        submitting={submitting}
        projects={projects}
        loadingProjects={loadingProjects}
        projectsError={projectsError}
        issueTypes={issueTypes}
        loadingIssueTypes={loadingIssueTypes}
        onClose={() => setComposeOpen(false)}
        onChange={handleComposeChange}
        onSubmit={handleComposeSubmit}
        onRetryProjects={loadProjects}
        onRetryIssueTypes={() => loadIssueTypes(composeForm.projectKey)}
      />
    </div>
  );
}
`;

content = content.replace(
  / {4}<\/div>\r?\n {2}\);\r?\n}\r?\n?$/,
  modalRender
);

fs.writeFileSync('fe/src/pages/JiraPage.jsx', content, 'utf8');
console.log('Done!');
