// Seeded engineering workflow data — used as dev fallback when backend not connected.

export type TaskStatus = "running" | "waiting" | "queued" | "completed" | "failed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  progress: number;
  agent: string;
  workspace: string;
  updatedAt: string;
  summary: string;
  filesChanged: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface TerminalLine {
  id: string;
  stream: "stdout" | "stderr" | "system";
  text: string;
  ts: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  modified?: string;
  children?: FileNode[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  kind: "info" | "success" | "warning" | "danger";
  at: string;
  read: boolean;
}

export interface Workspace { id: string; name: string; path: string; }
export interface Agent { id: string; name: string; role: string; active: boolean; }
export interface ModelOption { id: string; label: string; provider: string; }

export const MODELS: ModelOption[] = [
  { id: "omena-smart", label: "Omena Smart", provider: "omena" },
  { id: "gpt-5", label: "GPT-5", provider: "openai" },
  { id: "gpt-5-codex", label: "GPT-5 Codex", provider: "openai" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google" },
  { id: "claude-sonnet", label: "Claude Sonnet", provider: "anthropic" },
  { id: "claude-opus", label: "Claude Opus", provider: "anthropic" },
  { id: "deepseek", label: "DeepSeek", provider: "deepseek" },
  { id: "grok", label: "Grok", provider: "xai" },
  { id: "mistral-large", label: "Mistral Large", provider: "mistral" },
  { id: "qwen", label: "Qwen", provider: "qwen" },
];

export const WORKSPACES: Workspace[] = [
  { id: "omenacore", name: "omenacore", path: "/home/omena/omenacore" },
  { id: "omena-dashboard", name: "omena-dashboard", path: "/home/omena/dashboard" },
  { id: "omena-api", name: "omena-api", path: "/home/omena/api" },
];

export const AGENTS: Agent[] = [
  { id: "agent-zero", name: "Agent Zero", role: "General Purpose", active: false },
  { id: "backend", name: "Backend Agent", role: "Node.js Specialist", active: true },
  { id: "frontend", name: "Frontend Agent", role: "React Specialist", active: false },
  { id: "devops", name: "DevOps Agent", role: "Infrastructure", active: false },
  { id: "research", name: "Research Agent", role: "Information Specialist", active: false },
];

export const TASKS: Task[] = [
  {
    id: "t_login_api",
    title: "Implement Login API",
    status: "running",
    progress: 65,
    agent: "Backend Agent",
    workspace: "omenacore",
    updatedAt: "2m ago",
    summary: "Creating secure login API with JWT authentication, rate limiting, and validation.",
    filesChanged: 5,
  },
  {
    id: "t_payment_bug",
    title: "Fix Payment Bug",
    status: "waiting",
    progress: 40,
    agent: "Backend Agent",
    workspace: "omena-api",
    updatedAt: "5m ago",
    summary: "Reproduces NPE in Stripe webhook handler. Awaiting approval to deploy hotfix.",
    filesChanged: 2,
  },
  {
    id: "t_dashboard",
    title: "Create Dashboard",
    status: "queued",
    progress: 0,
    agent: "Frontend Agent",
    workspace: "omena-dashboard",
    updatedAt: "1m ago",
    summary: "Build operator dashboard with realtime task tiles.",
    filesChanged: 0,
  },
  {
    id: "t_db_setup",
    title: "Setup Database",
    status: "completed",
    progress: 100,
    agent: "DevOps Agent",
    workspace: "omenacore",
    updatedAt: "10m ago",
    summary: "Provisioned Postgres 16, migrations applied, seed loaded.",
    filesChanged: 12,
  },
  {
    id: "t_e2e",
    title: "E2E Test Suite",
    status: "failed",
    progress: 78,
    agent: "Backend Agent",
    workspace: "omenacore",
    updatedAt: "22m ago",
    summary: "2 specs failed in checkout flow. See logs.",
    filesChanged: 0,
  },
];

export const CHAT_SEED: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Create a secure login API with email and password using JWT. Add rate limiting and tests.",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "I'll create a secure login API for you. Here's my plan:\n\n1. Create auth routes\n2. Add validation\n3. Implement JWT auth\n4. Add rate limiting\n5. Write tests\n\nLet me start implementing…",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];

export const TERMINAL_SEED: TerminalLine[] = [
  { id: "l1", stream: "stdout", text: "$ npm run dev", ts: "" },
  { id: "l2", stream: "stdout", text: "> omenacore@1.0.0 dev", ts: "" },
  { id: "l3", stream: "stdout", text: "> nodemon server.js", ts: "" },
  { id: "l4", stream: "stdout", text: "[nodemon] 2.0.22", ts: "" },
  { id: "l5", stream: "stdout", text: "[nodemon] to restart at any time, enter `rs`", ts: "" },
  { id: "l6", stream: "stdout", text: "[nodemon] watching path(s): *.*", ts: "" },
  { id: "l7", stream: "stdout", text: "[nodemon] watching extensions: js,json", ts: "" },
  { id: "l8", stream: "stdout", text: "[nodemon] starting `node server.js`", ts: "" },
  { id: "l9", stream: "stdout", text: "Server running on port 3000", ts: "" },
  { id: "l10", stream: "stdout", text: "Connected to database", ts: "" },
  { id: "l11", stream: "stdout", text: "", ts: "" },
  { id: "l12", stream: "stdout", text: "$ npm run test", ts: "" },
  { id: "l13", stream: "stdout", text: "> omenacore@1.0.0 test", ts: "" },
  { id: "l14", stream: "stdout", text: "> jest", ts: "" },
  { id: "l15", stream: "stdout", text: "PASS tests/auth.test.js", ts: "" },
  { id: "l16", stream: "stdout", text: "PASS tests/user.test.js", ts: "" },
  { id: "l17", stream: "stdout", text: "", ts: "" },
  { id: "l18", stream: "stdout", text: "Test Suites: 2 passed, 2 total", ts: "" },
  { id: "l19", stream: "stdout", text: "Tests:       12 passed, 12 total", ts: "" },
  { id: "l20", stream: "stdout", text: "Snapshots:   0 total", ts: "" },
  { id: "l21", stream: "stdout", text: "Time:        2.345 s", ts: "" },
  { id: "l22", stream: "stdout", text: "Ran all test suites.", ts: "" },
];

export const FILE_TREE: FileNode = {
  name: "omenacore",
  path: "omenacore",
  type: "dir",
  children: [
    { name: ".github", path: "omenacore/.github", type: "dir", children: [] },
    {
      name: "backend",
      path: "omenacore/backend",
      type: "dir",
      children: [
        {
          name: "src",
          path: "omenacore/backend/src",
          type: "dir",
          children: [
            { name: "controllers", path: "omenacore/backend/src/controllers", type: "dir", children: [
              { name: "authController.js", path: "omenacore/backend/src/controllers/authController.js", type: "file", size: 2150, modified: "2m ago" },
            ]},
            { name: "routes", path: "omenacore/backend/src/routes", type: "dir", children: [] },
            { name: "middleware", path: "omenacore/backend/src/middleware", type: "dir", children: [] },
            { name: "models", path: "omenacore/backend/src/models", type: "dir", children: [] },
            { name: "server.js", path: "omenacore/backend/src/server.js", type: "file", size: 980, modified: "12m ago" },
          ],
        },
        { name: "tests", path: "omenacore/backend/tests", type: "dir", children: [] },
        { name: ".env", path: "omenacore/backend/.env", type: "file", size: 420, modified: "1h ago" },
        { name: "package.json", path: "omenacore/backend/package.json", type: "file", size: 1240, modified: "1d ago" },
      ],
    },
    { name: "README.md", path: "omenacore/README.md", type: "file", size: 3200, modified: "2d ago" },
  ],
};

export const FILE_CONTENTS: Record<string, string> = {
  "omenacore/backend/src/controllers/authController.js": `const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
`,
  "omenacore/README.md": `# Omenacore\n\nAgent Operating System backend.\n`,
};

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Deployment Complete", body: "Production server updated", kind: "success", at: "2m ago", read: false },
  { id: "n2", title: "Tests Passed", body: "All tests passed (12)", kind: "success", at: "5m ago", read: false },
  { id: "n3", title: "Approval Required", body: "npm run deploy", kind: "warning", at: "7m ago", read: false },
  { id: "n4", title: "Task Failed", body: "Fix Payment Bug", kind: "danger", at: "15m ago", read: true },
];
