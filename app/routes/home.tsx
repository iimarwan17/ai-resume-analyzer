import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ResumIt" },
    { name: "description", content: "Samrt feedack for your job!" },
  ];
}

// ── Wipe Confirmation Modal ────
function WipeModal({
  onConfirm,
  onCancel,
  wiping,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  wiping: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!wiping ? onCancel : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 flex flex-col gap-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a2 2 0 00-2-2H9a2 2 0 00-2 2m10 0H5"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-gray-900">Wipe All Data?</h3>
          <p className="text-dark-200 text-base leading-relaxed">
            This will permanently delete all your uploaded resumes and AI
            feedback. <span className="font-semibold text-gray-700">This action cannot be undone.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2">
          <button
            onClick={onCancel}
            disabled={wiping}
            className="flex-1 py-3 px-5 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={wiping}
            className="flex-1 py-3 px-5 rounded-full font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer"
            style={{
              background: wiping
                ? "#f87171"
                : "linear-gradient(to bottom, #ef4444, #b91c1c)",
            }}
          >
            {wiping ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Wiping…
              </span>
            ) : (
              "Yes, Wipe Everything"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Home Page ──────
export default function Home() {
  const { auth, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = await kv.list('resume*', true) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (JSON.parse(resume.value) as Resume));

      setResumes(parsedResumes || []);

      setLoadingResumes(false);
    }

    loadResumes();
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  const handleWipeConfirm = async () => {
    setWiping(true);
    try {
      const files = (await fs.readDir("./")) as FSItem[];
      await Promise.all(files.map((file) => fs.delete(file.path)));
      await kv.flush();
      setResumes([]);
      setShowWipeModal(false);
    } finally {
      setWiping(false);
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications &amp; Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" alt="resumeLogo" className="w-200" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
            <div className="flex justify-end mt-6 w-full">
              <button
                onClick={() => setShowWipeModal(true)}
                disabled={wiping}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-full font-semibold transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a2 2 0 00-2-2H9a2 2 0 00-2 2m10 0H5" />
                </svg>
                Wipe All Data
              </button>
            </div>
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to='/upload' className="primary-button w-fit text-xl font-semibold">Upload Resume</Link>
          </div>
        )}
      </section>

      {showWipeModal && (
        <WipeModal
          onConfirm={handleWipeConfirm}
          onCancel={() => setShowWipeModal(false)}
          wiping={wiping}
        />
      )}
    </main>
  );
}
