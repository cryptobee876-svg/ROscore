import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ScoreGauge from './components/ScoreGauge';
import ModuleCard from './components/ModuleCard';
import ChatBot from './components/ChatBot';
import SocialShare from './components/SocialShare';
import { analyzeResume } from './services/geminiService';
import { AnalysisResult, ParsingStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    setStatus(ParsingStatus.UPLOADING);
    setErrorMsg("");

    try {
      // 1. Convert file to Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove Data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Determine mimeType
      const mimeType = file.type || 'application/pdf'; // Default to PDF if unknown, though explicit checking is better

      setStatus(ParsingStatus.ANALYZING);
      
      // 3. Call Gemini
      const analysis = await analyzeResume(base64Data, mimeType);
      
      setResult(analysis);
      setStatus(ParsingStatus.COMPLETE);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze resume. Please ensure you are using a valid PDF/DOCX and try again.");
      setStatus(ParsingStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(ParsingStatus.IDLE);
    setResult(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-infosys-blue to-tcs-purple rounded-md flex items-center justify-center text-white font-bold text-lg">
              RO
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              ROscore <span className="text-infosys-blue">ai</span>
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            Indian Tech Resume Rater
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro Section (only show when IDLE) */}
        {status === ParsingStatus.IDLE && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-extrabold text-tech-dark mb-4">
              Is your resume ready for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-infosys-blue to-tcs-purple">
                India's Top Tech Companies?
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our AI evaluates your resume against strict Indian hiring benchmarks (Academics, Professional Norms, Project Depth).
              Stop guessing, get data-driven feedback.
            </p>
            <div className="max-w-md mx-auto">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )}

        {/* Loading State */}
        {(status === ParsingStatus.UPLOADING || status === ParsingStatus.ANALYZING) && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-16 h-16 border-4 border-infosys-blue border-t-transparent rounded-full animate-spin mb-6"></div>
             <h3 className="text-xl font-semibold text-gray-800">
               {status === ParsingStatus.UPLOADING ? 'Reading Document...' : 'AI Recruiter is Analyzing...'}
             </h3>
             <p className="text-gray-500 mt-2 max-w-md text-center">
               Checking for academic gaps, project relevance, and professionalism flags against 100+ Indian hiring benchmarks.
             </p>
          </div>
        )}

        {/* Error State */}
        {status === ParsingStatus.ERROR && (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block mb-4 max-w-xl">
              {errorMsg}
            </div>
            <div>
              <button 
                onClick={reset}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {status === ParsingStatus.COMPLETE && result && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top Bar: Identity & Score */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">{result.candidateProfile.name}</h2>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {result.candidateProfile.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Target Role: <span className="font-semibold text-gray-800">{result.candidateProfile.targetRole}</span> | 
                  Exp: <span className="font-semibold text-gray-800">{result.candidateProfile.detectedYoE} Years</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.criticalRedFlags.length > 0 ? (
                     result.criticalRedFlags.map((flag, i) => (
                       <span key={i} className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                         🚩 {flag}
                       </span>
                     ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                       ✓ No Critical Red Flags Found
                    </span>
                  )}
                </div>
              </div>
              
              {/* Score and Share Section */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="flex items-center justify-center">
                  <ScoreGauge score={result.overallScore} />
                </div>
                
                {/* Social Sharing */}
                <SocialShare score={result.overallScore} percentile={result.percentile} />
              </div>

            </div>

            {/* Main Grid: Modules */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Module Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ModuleCard title="Academic & Eligibility" data={result.modules.academics} />
                <ModuleCard title="Tech Stack Relevance" data={result.modules.techSkills} />
                <ModuleCard title="Projects & Internships" data={result.modules.projects} />
                <ModuleCard title="Experience & Impact" data={result.modules.experience} />
                <ModuleCard title="Professional Norms (Indian)" data={result.modules.professionalism} />
                <ModuleCard title="Formatting & Structure" data={result.modules.formatting} />
              </div>
            </div>

            {/* Bottom Section: Leverage Fixes */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 md:p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Top High-Leverage Fixes</h3>
              </div>
              
              <div className="grid gap-4">
                {result.topLeverageFixes.map((fix, idx) => (
                  <div key={idx} className="bg-white/10 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-bold bg-yellow-500 text-black px-2 py-0.5 rounded">
                         {fix.category}
                       </span>
                    </div>
                    <p className="text-lg font-medium mb-2">{fix.fix}</p>
                    <div className="bg-black/30 p-3 rounded text-sm font-mono text-gray-300">
                      <span className="text-green-400">Try:</span> {fix.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={reset}
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition"
              >
                Scan Another Resume
              </button>
            </div>
            
            {/* ChatBot attached to the analysis result */}
            <ChatBot result={result} />

          </div>
        )}
      </main>
    </div>
  );
};

export default App;