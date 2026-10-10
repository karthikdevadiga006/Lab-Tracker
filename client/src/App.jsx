import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "/api";
const RECORDS_COUNTER_KEY = "recordsUpdatedToday";
const COLLEGE_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHdBPgfN6Jt6vUYHHdLgI5zOJWd_uvWH6fAA&s";
const SEMESTERS = ["3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C"];
const BATCHES = {
  A: ["A1", "A2", "A3"],
  B: ["B1", "B2", "B3"],
  C: ["C1", "C2", "C3"],
};

const emptyAdminSubjects = () => ({ 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] });
const normalizeCode = (value) => value.trim().toUpperCase();
const getTeacherToken = () => localStorage.getItem("token");
const getTeacherUsername = () => localStorage.getItem("username");
const getAdminToken = () => localStorage.getItem("adminToken");
const getAdminUsername = () => localStorage.getItem("adminUsername");

const getTodayStamp = () => new Date().toISOString().slice(0, 10);

const getRecordsUpdatedToday = () => {
  try {
    const raw = localStorage.getItem(RECORDS_COUNTER_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.date !== getTodayStamp()) return 0;
    return Number.isFinite(parsed.count) ? parsed.count : 0;
  } catch {
    return 0;
  }
};

const setRecordsUpdatedToday = (count) => {
  localStorage.setItem(
    RECORDS_COUNTER_KEY,
    JSON.stringify({ date: getTodayStamp(), count })
  );
};

const loadImageAsDataUrl = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = src;
  });

const teacherHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getTeacherToken()}`,
});

const adminHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAdminToken()}`,
});

// ─── LANDING PAGE ───────────────────────────────────────────────────────────
function LandingPage({ onGoLogin, onGoRegister, recordsUpdated }) {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 500;
    const start = performance.now();
    const from = animatedCount;
    const to = recordsUpdated;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(from + (to - from) * progress);
      setAnimatedCount(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [recordsUpdated]);

  return (
    <div className="landing-bg">
      <div className="landing-grid">
        <div className="landing-copy">
          <p className="landing-kicker">Lab Management Simplified</p>
          <h1>Lab Tracker</h1>
          <p className="landing-tagline">Track your lab experiments effortlessly</p>
          <div className="landing-actions">
            <button className="btn-primary landing-btn" onClick={onGoLogin}>Login</button>
            <button className="btn-ghost landing-btn" onClick={onGoRegister}>Register</button>
          </div>
        </div>

        <div className="landing-hero" aria-hidden="true">
          <div className="hero-card hero-card-main">
            <h3>Experiment Progress</h3>
            <p>Realtime completion overview by section and batch.</p>
            <div className="hero-progress">
              <span style={{ width: "72%" }} />
            </div>
          </div>
          <div className="hero-card hero-card-float">
            <p className="hero-mini-title">Today</p>
            <strong>{animatedCount} Records Updated</strong>
            <span className="hero-mini-sub">Synced in this browser</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onGoRegister, onBack }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      onLogin(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split">
      {/* ── Left Branding Panel ── */}
      <div className="login-brand-panel">
        <button type="button" className="btn-auth-back login-back-light" onClick={onBack}>← Back</button>

        <div className="brand-content">
          <div className="brand-logo-row">
            <svg viewBox="0 0 40 40" fill="none" className="brand-icon">
              <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.15)"/>
              <path d="M8 12h24M8 20h16M8 28h20" stroke="#4fc3f7" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="30" cy="28" r="5" fill="#4fc3f7"/>
              <path d="M28 28l1.5 1.5L32 26" stroke="#0f2540" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="brand-name">Lab Tracker</span>
          </div>

          <h2 className="brand-heading">Manage your lab records<br/>with confidence.</h2>
          <p className="brand-description">
            A streamlined platform built for teachers to track experiments, manage sections, and generate reports — all in one place.
          </p>

          <div className="brand-features">
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <strong>Experiment Tracking</strong>
                <span>Mark completion, dates & remarks per batch</span>
              </div>
            </div>
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <strong>PDF Reports</strong>
                <span>Export professional lab records instantly</span>
              </div>
            </div>
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <strong>Section & Batch Management</strong>
                <span>Organize students across multiple batches</span>
              </div>
            </div>
          </div>

          <div className="brand-testimonial">
            <p>&ldquo;Lab Tracker has saved us hours of manual paperwork every week. It&apos;s incredibly intuitive.&rdquo;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">DS</div>
              <div>
                <strong>Dr. Sharma</strong>
                <span>HOD, Computer Science</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <span>© {new Date().getFullYear()} Lab Tracker</span>
          <span>·</span>
          <span>Dayananda Sagar College of Engineering</span>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h1>Welcome back</h1>
            <p className="login-sub">Sign in to your teacher account to continue</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="field">
              <label>Username</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <button type="button" className="link-btn" onClick={onGoRegister}>Create an account</button>
          </p>

          <p className="login-admin-hint">
            Are you an admin?{" "}
            <a href="/admin" className="link-btn">Go to Admin Panel</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onGoLogin, onBack }) {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess("Account created!");
      timerRef.current = setTimeout(() => {
        onGoLogin();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split">
      {/* ── Left Branding Panel ── */}
      <div className="login-brand-panel">
        <button type="button" className="btn-auth-back login-back-light" onClick={onBack}>← Back</button>

        <div className="brand-content">
          <div className="brand-logo-row">
            <svg viewBox="0 0 40 40" fill="none" className="brand-icon">
              <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.15)"/>
              <path d="M8 12h24M8 20h16M8 28h20" stroke="#4fc3f7" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="30" cy="28" r="5" fill="#4fc3f7"/>
              <path d="M28 28l1.5 1.5L32 26" stroke="#0f2540" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="brand-name">Lab Tracker</span>
          </div>

          <h2 className="brand-heading">Join the platform<br/>trusted by educators.</h2>
          <p className="brand-description">
            Create your account in seconds and start managing lab experiments, tracking progress, and generating reports.
          </p>

          <div className="brand-stats">
            <div className="brand-stat">
              <strong>500+</strong>
              <span>Teachers</span>
            </div>
            <div className="brand-stat">
              <strong>12,000+</strong>
              <span>Records Managed</span>
            </div>
            <div className="brand-stat">
              <strong>98%</strong>
              <span>Satisfaction</span>
            </div>
          </div>

          <div className="brand-testimonial">
            <p>&ldquo;Setting up was effortless. I was managing lab sheets within minutes of signing up.&rdquo;</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">RK</div>
              <div>
                <strong>Prof. Rajesh Kumar</strong>
                <span>Dept. of Electronics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <span>© {new Date().getFullYear()} Lab Tracker</span>
          <span>·</span>
          <span>Dayananda Sagar College of Engineering</span>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h1>Create your account</h1>
            <p className="login-sub">Fill in the details below to get started</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="field">
              <label>Username</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <button type="submit" className="btn-primary login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={onGoLogin}>Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (!data.isAdmin) throw new Error("You do not have admin access");
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUsername", data.username);
      onLogin(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg login-bg">
      <div className="login-card admin-login-card">
        <div className="login-logo">
          <svg viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0f2540"/>
            <path d="M8 12h24M8 20h16M8 28h20" stroke="#81d4fa" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="30" cy="28" r="5" fill="#81d4fa"/>
            <path d="M28 28l1.5 1.5L32 26" stroke="#0f2540" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Admin Login</h1>
        <p className="login-sub">Lab Tracker Admin Panel</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLoad }) {
  const [form, setForm] = useState({
    sem: "6",
    section: "A",
    batch: "A1",
    subject: null,
    subjectCode: null,
  });
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubjects = async () => {
      setSubjectsLoading(true);
      setSubjectsError("");
      try {
        const res = await fetch(`${API}/subjects?semester=${form.sem}`, {
          headers: teacherHeaders(),
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.reload();
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load subjects");
        setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setSubjects([]);
        setSubjectsError(err.message);
      } finally {
        setSubjectsLoading(false);
      }
    };

    loadSubjects();
  }, [form.sem]);

  useEffect(() => {
    if (!subjects.length) {
      setForm((prev) => ({ ...prev, subject: null, subjectCode: null }));
      return;
    }

    setForm((prev) => {
      const current = subjects.find((subject) => subject.code === prev.subjectCode);
      if (current) {
        return { ...prev, subject: current.name, subjectCode: current.code };
      }
      return { ...prev, subject: subjects[0].name, subjectCode: subjects[0].code };
    });
  }, [subjects]);

  const selectedSubject = subjects.find((subject) => subject.code === form.subjectCode);
  const availableBatches = BATCHES[form.section];

  useEffect(() => {
    setForm((f) => ({ ...f, batch: BATCHES[f.section][0] }));
  }, [form.section]);

  const handleSubjectChange = (subjectCode) => {
    const selectedSub = subjects.find((subject) => subject.code === subjectCode);
    if (selectedSub) {
      setForm((f) => ({
        ...f,
        subject: selectedSub.name,
        subjectCode: selectedSub.code,
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !form.subjectCode) {
      setError("Please select a valid subject before loading.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/records/load`, {
        method: "POST",
        headers: teacherHeaders(),
        body: JSON.stringify({
          sem: form.sem,
          section: form.section,
          batch: form.batch,
          subject: selectedSubject.name,
          subjectCode: form.subjectCode,
        }),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onLoad(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h2>Load Lab Sheet</h2>
        <p className="dashboard-sub">Select class details to load or resume the experiment list</p>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Semester</label>
              <select value={form.sem} onChange={(e) => setForm({ ...form, sem: e.target.value })}>
                {SEMESTERS.map((semester) => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Section</label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Batch</label>
              <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
                {availableBatches.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="field full">
              <label>Subject</label>
              <select value={form.subjectCode || ""} onChange={(e) => handleSubjectChange(e.target.value)}>
                <option value="">{subjectsLoading ? "Loading subjects…" : "Select a subject"}</option>
                {subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>{subject.name}</option>
                ))}
              </select>
              {!subjectsLoading && !subjects.length && !subjectsError && (
                <p className="field-note">No subjects available for this semester</p>
              )}
              {subjectsError && <p className="field-note error-note">{subjectsError}</p>}
            </div>
            <div className="field full">
              <label>Subject Code</label>
              <input type="text" value={form.subjectCode || ""} readOnly className="readonly" />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Loading…" : "Load Experiments →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LabSheet({ record, onBack, onRecordSaved }) {
  const [exps, setExps] = useState(record.experiments.map((e) => ({ ...e })));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const completedCount = exps.filter((e) => e.completed).length;

  const updateExp = (i, field, value) => {
    setExps((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
    setSaved(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/records/${record._id}`, {
        method: "PUT",
        headers: teacherHeaders(),
        body: JSON.stringify({ experiments: exps }),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
      }
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      if (onRecordSaved) onRecordSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: "landscape" });
    let logoDataUrl = null;

    try {
      logoDataUrl = await loadImageAsDataUrl(COLLEGE_LOGO_URL);
    } catch (error) {
      console.warn("College logo could not be loaded for PDF export.", error);
    }

    // Header
    doc.setFillColor(26, 58, 92);
    doc.rect(0, 0, 297, 30, "F");

    if (logoDataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.circle(17, 15, 11, "F");
      doc.addImage(logoDataUrl, "PNG", 7.5, 5.5, 19, 19);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Dayananda Sagar College of Engineering, Bangalore", 148, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${record.subject}  |  ${record.subjectCode}`, 148, 20, { align: "center" });
    doc.text(
      `Sem: ${record.sem}   Section: ${record.section}   Batch: ${record.batch}`,
      148, 27, { align: "center" }
    );

    // Summary bar
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text(
      `Total: ${exps.length}   Completed: ${completedCount}   Pending: ${exps.length - completedCount}   Generated: ${new Date().toLocaleDateString("en-IN")}`,
      148, 36, { align: "center" }
    );

    autoTable(doc, {
      startY: 42,
      head: [["#", "Experiment Title", "Date", "Time", "Remark", "Status"]],
      body: exps.map((e) => [
        e.expNo,
        e.title,
        e.date || "—",
        e.time || "—",
        e.remark || "—",
        e.completed ? "✓ Completed" : "Pending",
      ]),
      headStyles: { fillColor: [26, 58, 92], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 90 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 22, halign: "center" },
        4: { cellWidth: 70 },
        5: { cellWidth: 28, halign: "center" },
      },
      margin: { bottom: 24 },
      alternateRowStyles: { fillColor: [240, 247, 255] },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.section === "body") {
          const val = data.cell.raw;
          if (val === "✓ Completed") {
            doc.setTextColor(0, 140, 70);
          } else {
            doc.setTextColor(180, 60, 0);
          }
        }
      },
    });

    // Teacher sign block on the final page, bottom-right.
    const totalPages = doc.getNumberOfPages();
    doc.setPage(totalPages);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const signY = pageHeight - 12;
    const lineStartX = pageWidth - 78;
    const lineEndX = pageWidth - 20;

    doc.setDrawColor(90, 90, 90);
    doc.setLineWidth(0.3);
    doc.line(lineStartX, signY - 4, lineEndX, signY - 4);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Signature", lineEndX, signY, { align: "right" });

    doc.save(`LabRecord_${record.subjectCode}_Sec${record.section}_${record.batch}.pdf`);
  };

  return (
    <div className="labsheet">
      {/* Header */}
      <div className="sheet-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="sheet-title">
          <h2>{record.subject}</h2>
          <span className="meta">
            Sem {record.sem} · Section {record.section} · Batch {record.batch} · {record.subjectCode}
          </span>
        </div>
        <div className="progress-chip">
          <span className="prog-num">{completedCount}</span>
          <span className="prog-sep">/</span>
          <span className="prog-total">{exps.length}</span>
          <span className="prog-label">done</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${(completedCount / exps.length) * 100}%` }}
        />
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="exp-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Experiment Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Remark</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {exps.map((exp, i) => (
              <tr key={exp.expNo} className={exp.completed ? "row-done" : ""}>
                <td className="td-num">
                  <input
                    className="cell-input"
                    type="number"
                    value={String(exp.expNo)}
                    onChange={(e) => updateExp(i, "expNo", parseInt(e.target.value, 10) || 0)}
                  />
                </td>
                <td className="td-title">
                  <input
                    className="cell-input title-input"
                    value={exp.title}
                    onChange={(e) => updateExp(i, "title", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    className="cell-input"
                    value={exp.date}
                    onChange={(e) => updateExp(i, "date", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="cell-input"
                    value={exp.time}
                    onChange={(e) => updateExp(i, "time", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    placeholder="Add remark…"
                    value={exp.remark}
                    onChange={(e) => updateExp(i, "remark", e.target.value)}
                  />
                </td>
                <td className="td-check">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={exp.completed}
                      onChange={(e) => updateExp(i, "completed", e.target.checked)}
                    />
                    <span className="toggle-track">
                      <span className="toggle-thumb" />
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="sheet-actions">
        {error && <p className="error-msg">{error}</p>}
        {saved && <p className="success-msg">✓ Changes saved</p>}
        <button className="btn-save" onClick={saveChanges} disabled={saving}>
          {saving ? "Saving…" : "💾 Save Changes"}
        </button>
        <button className="btn-pdf" onClick={exportPDF}>
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}

function AdminPanel({ username, onLogout }) {
  const [subjectsBySemester, setSubjectsBySemester] = useState(emptyAdminSubjects);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [experiments, setExperiments] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingExperiments, setLoadingExperiments] = useState(false);
  const [message, setMessage] = useState("");
  const [subjectModal, setSubjectModal] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [experimentMode, setExperimentMode] = useState(null);
  const [experimentDraft, setExperimentDraft] = useState({ expNo: 0, title: "" });

  const selectedSubject = SEMESTERS.flatMap((semester) => subjectsBySemester[semester] || [])
    .find((subject) => subject.code === selectedSubjectCode);

  const handleSessionFailure = () => {
    onLogout();
  };

  const loadSubjects = async (preferredCode = null) => {
    setLoadingSubjects(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/admin/subjects`, { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403) {
        handleSessionFailure();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load subjects");
      const nextGrouped = emptyAdminSubjects();
      SEMESTERS.forEach((semester) => {
        nextGrouped[semester] = Array.isArray(data?.[semester]) ? data[semester] : [];
      });
      setSubjectsBySemester(nextGrouped);

      const allSubjects = SEMESTERS.flatMap((semester) => nextGrouped[semester]);
      const nextSelected =
        preferredCode && allSubjects.find((subject) => subject.code === preferredCode)
          ? preferredCode
          : allSubjects[0]?.code || "";
      setSelectedSubjectCode(nextSelected);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadExperiments = async (code) => {
    if (!code) {
      setExperiments([]);
      return;
    }

    setLoadingExperiments(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/admin/experiments/${code}`, {
        headers: adminHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        handleSessionFailure();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load experiments");
      setExperiments(Array.isArray(data) ? [...data].sort((a, b) => a.expNo - b.expNo) : []);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingExperiments(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadExperiments(selectedSubjectCode);
  }, [selectedSubjectCode]);

  const saveSubject = async () => {
    if (!subjectModal) return;
    try {
      const payload = {
        name: subjectModal.form.name.trim(),
        code: normalizeCode(subjectModal.form.code),
        semester: subjectModal.form.semester,
      };
      const url = subjectModal.mode === "edit"
        ? `${API}/admin/subjects/${subjectModal.originalCode}`
        : `${API}/admin/subjects`;
      const method = subjectModal.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        handleSessionFailure();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save subject");
      setSubjectModal(null);
      await loadSubjects(data.code);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deleteSubject = (subject) => {
    setConfirmState({
      message: "This will also delete all experiments under this subject. Are you sure?",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/admin/subjects/${subject.code}`, {
            method: "DELETE",
            headers: adminHeaders(),
          });
          if (res.status === 401 || res.status === 403) {
            handleSessionFailure();
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to delete subject");
          setConfirmState(null);
          await loadSubjects();
        } catch (err) {
          setMessage(err.message);
        }
      },
    });
  };

  const startAddExperiment = () => {
    const nextExpNo = experiments.length ? Math.max(...experiments.map((item) => Number(item.expNo) || 0)) + 1 : 1;
    setExperimentMode({ type: "create" });
    setExperimentDraft({ expNo: nextExpNo, title: "" });
  };

  const startEditExperiment = (experiment) => {
    setExperimentMode({ type: "edit", id: experiment._id });
    setExperimentDraft({ expNo: experiment.expNo, title: experiment.title });
  };

  const saveExperiment = async () => {
    if (!selectedSubject) return;
    try {
      const payload = {
        expNo: Number(experimentDraft.expNo),
        title: experimentDraft.title.trim(),
      };
      const url = experimentMode.type === "edit"
        ? `${API}/admin/experiments/${selectedSubject.code}/${experimentMode.id}`
        : `${API}/admin/experiments/${selectedSubject.code}`;
      const method = experimentMode.type === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        handleSessionFailure();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save experiment");
      setExperimentMode(null);
      setExperimentDraft({ expNo: 0, title: "" });
      await loadExperiments(selectedSubject.code);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const deleteExperiment = (experiment) => {
    setConfirmState({
      message: "Delete this experiment?",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/admin/experiments/${selectedSubject.code}/${experiment._id}`, {
            method: "DELETE",
            headers: adminHeaders(),
          });
          if (res.status === 401 || res.status === 403) {
            handleSessionFailure();
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to delete experiment");
          setConfirmState(null);
          await loadExperiments(selectedSubject.code);
        } catch (err) {
          setMessage(err.message);
        }
      },
    });
  };

  const saveLabel = experimentMode?.type === "edit" ? "Save Changes" : "Save";

  return (
    <div className="admin-shell">
      <nav className="admin-topnav">
        <div className="nav-brand">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <rect width="24" height="24" rx="6" fill="#0f2540"/>
            <path d="M5 7h14M5 12h9M5 17h11" stroke="#81d4fa" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Lab Tracker — Admin Panel
        </div>
        <div className="nav-right">
          <span className="nav-user">👤 {username}</span>
          <button className="btn-nav btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-layout">
        <aside className="admin-left">
          <div className="admin-section-head">
            <div>
              <h2>Subjects</h2>
              <p>Manage subjects by semester</p>
            </div>
            <button className="btn-add" onClick={() => setSubjectModal({
              mode: "create",
              originalCode: "",
              form: { name: "", code: "", semester: "6" },
            })}>
              Add New Subject
            </button>
          </div>

          {loadingSubjects && <p className="field-note">Loading subjects…</p>}
          {message && <p className="error-msg">{message}</p>}

          <div className="semester-list">
            {SEMESTERS.map((semester) => (
              <section key={semester} className="semester-block">
                <div className="semester-group">Semester {semester}</div>
                <div className="subject-stack">
                  {subjectsBySemester[semester]?.length ? (
                    subjectsBySemester[semester].map((subject) => (
                      <div
                        key={subject.code}
                        className={`subject-card ${selectedSubjectCode === subject.code ? "active" : ""}`}
                        onClick={() => setSelectedSubjectCode(subject.code)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="subject-card-main">
                          <strong>{subject.name}</strong>
                          <span>{subject.code}</span>
                        </div>
                        <div className="subject-card-meta">
                          <span className="semester-badge">Sem {subject.semester}</span>
                          <div className="subject-card-actions">
                            <button
                              className="btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubjectModal({
                                  mode: "edit",
                                  originalCode: subject.code,
                                  form: {
                                    name: subject.name,
                                    code: subject.code,
                                    semester: subject.semester,
                                  },
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSubject(subject);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No subjects in this semester</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <main className="admin-right">
          {selectedSubject ? (
            <>
              <div className="admin-section-head">
                <div>
                  <h2>{selectedSubject.name}</h2>
                  <p>{selectedSubject.code} · Semester {selectedSubject.semester}</p>
                </div>
                <button className="btn-add" onClick={startAddExperiment}>Add Experiment</button>
              </div>

              {loadingExperiments && <p className="field-note">Loading experiments…</p>}
              <div className="table-wrap admin-table-wrap">
                <table className="exp-table">
                  <thead>
                    <tr>
                      <th>Exp No</th>
                      <th>Title</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.map((experiment) => {
                      const isEditing = experimentMode?.type === "edit" && experimentMode.id === experiment._id;
                      if (isEditing) {
                        return (
                          <tr key={experiment._id} className="inline-edit-row">
                            <td>
                              <input
                                className="cell-input"
                                type="number"
                                value={String(experimentDraft.expNo)}
                                onChange={(e) => setExperimentDraft({ ...experimentDraft, expNo: parseInt(e.target.value, 10) || 0 })}
                              />
                            </td>
                            <td>
                              <input
                                className="cell-input"
                                value={experimentDraft.title}
                                onChange={(e) => setExperimentDraft({ ...experimentDraft, title: e.target.value })}
                              />
                            </td>
                            <td className="row-actions">
                              <button className="btn-add" onClick={saveExperiment}>{saveLabel}</button>
                              <button
                                className="btn-danger"
                                onClick={() => {
                                  setExperimentMode(null);
                                  setExperimentDraft({ expNo: 0, title: "" });
                                }}
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={experiment._id}>
                          <td className="td-num">{experiment.expNo}</td>
                          <td>{experiment.title}</td>
                          <td className="row-actions">
                            <button className="btn-edit" onClick={() => startEditExperiment(experiment)}>Edit</button>
                            <button className="btn-danger" onClick={() => deleteExperiment(experiment)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}

                    {experimentMode?.type === "create" && (
                      <tr className="inline-edit-row">
                        <td>
                          <input
                            className="cell-input"
                            type="number"
                            value={String(experimentDraft.expNo)}
                            onChange={(e) => setExperimentDraft({ ...experimentDraft, expNo: parseInt(e.target.value, 10) || 0 })}
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            value={experimentDraft.title}
                            onChange={(e) => setExperimentDraft({ ...experimentDraft, title: e.target.value })}
                            placeholder="Experiment title"
                          />
                        </td>
                        <td className="row-actions">
                          <button className="btn-add" onClick={saveExperiment}>{saveLabel}</button>
                          <button
                            className="btn-danger"
                            onClick={() => {
                              setExperimentMode(null);
                              setExperimentDraft({ expNo: "", title: "" });
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-panel">
              <h2>Select a subject</h2>
              <p>Choose a subject from the left column to manage its experiments.</p>
            </div>
          )}
        </main>
      </div>

      {subjectModal && (
        <div className="admin-modal-overlay" onClick={() => setSubjectModal(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{subjectModal.mode === "edit" ? "Edit Subject" : "Add Subject"}</h3>
            <div className="field">
              <label>Subject Name</label>
              <input
                type="text"
                value={subjectModal.form.name}
                onChange={(e) => setSubjectModal({
                  ...subjectModal,
                  form: { ...subjectModal.form, name: e.target.value },
                })}
              />
            </div>
            <div className="field">
              <label>Subject Code</label>
              <input
                type="text"
                value={subjectModal.form.code}
                onChange={(e) => setSubjectModal({
                  ...subjectModal,
                  form: { ...subjectModal.form, code: normalizeCode(e.target.value) },
                })}
              />
            </div>
            <div className="field">
              <label>Semester</label>
              <select
                value={subjectModal.form.semester}
                onChange={(e) => setSubjectModal({
                  ...subjectModal,
                  form: { ...subjectModal.form, semester: e.target.value },
                })}
              >
                {SEMESTERS.map((semester) => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-add" onClick={saveSubject}>Save</button>
              <button className="btn-danger" onClick={() => setSubjectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmState && (
        <div className="admin-modal-overlay" onClick={() => setConfirmState(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>{confirmState.message}</p>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => {
                  const action = confirmState.onConfirm;
                  setConfirmState(null);
                  action();
                }}
              >
                Confirm
              </button>
              <button className="btn-edit" onClick={() => setConfirmState(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherApp() {
  const [user, setUser] = useState(() => (getTeacherToken() ? (getTeacherUsername() || "Teacher") : null));
  const [page, setPage] = useState(() => (getTeacherToken() ? "login" : "landing"));
  const [record, setRecord] = useState(null);
  const [recordsUpdated, setRecordsUpdated] = useState(() => getRecordsUpdatedToday());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === RECORDS_COUNTER_KEY) {
        setRecordsUpdated(getRecordsUpdatedToday());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleRecordSaved = () => {
    setRecordsUpdated((prev) => {
      const next = prev + 1;
      setRecordsUpdatedToday(next);
      return next;
    });
  };

  const handleLogin = (username) => {
    localStorage.setItem("username", username);
    setUser(username);
    setPage("login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setRecord(null);
    setPage("landing");
  };

  if (!user) {
    if (page === "landing") {
      return (
        <LandingPage
          onGoLogin={() => setPage("login")}
          onGoRegister={() => setPage("register")}
          recordsUpdated={recordsUpdated}
        />
      );
    }
    if (page === "register") {
      return <RegisterPage onGoLogin={() => setPage("login")} onBack={() => setPage("landing")} />;
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setPage("register")}
        onBack={() => setPage("landing")}
      />
    );
  }

  return (
    <div className="app">
      <nav className="topnav">
        <div className="nav-brand">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <rect width="24" height="24" rx="6" fill="#1a3a5c"/>
            <path d="M5 7h14M5 12h9M5 17h11" stroke="#4fc3f7" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Lab Tracker
        </div>
        <div className="nav-right">
          <span className="nav-user">👤 {user}</span>
          {record && (
            <button className="btn-nav" onClick={() => setRecord(null)}>Dashboard</button>
          )}
          <button className="btn-nav btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {!record ? <Dashboard onLoad={setRecord} /> : <LabSheet record={record} onBack={() => setRecord(null)} onRecordSaved={handleRecordSaved} />}
    </div>
  );
}

function AdminApp() {
  const [adminToken, setAdminToken] = useState(() => getAdminToken());
  const [adminUsername, setAdminUsername] = useState(() => getAdminUsername() || "Admin");

  const handleAdminLogin = (username) => {
    setAdminToken(getAdminToken());
    setAdminUsername(username);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    setAdminToken(null);
    setAdminUsername("Admin");
  };

  if (!adminToken) {
    return <AdminLoginPage onLogin={handleAdminLogin} />;
  }

  return <AdminPanel username={adminUsername} onLogout={handleAdminLogout} />;
}

// ─── APP ROOT ───────────────────────────────────────────────────────────────
export default function App() {
  const isAdminRoute = window.location.pathname.replace(/\/$/, "") === "/admin";

  return isAdminRoute ? <AdminApp /> : <TeacherApp />;
}
