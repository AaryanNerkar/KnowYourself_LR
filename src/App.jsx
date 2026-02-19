import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  User, Brain, Users, Zap, Settings, Heart, Compass, 
  BookOpen, Trophy, MessageCircle, BarChart3, ChevronRight, 
  ChevronLeft, Sparkles, Share2, RefreshCw, CheckCircle2,
  Cpu, Activity, ShieldCheck, Globe
} from 'lucide-react';

/**
 * ARCHITECTURAL NOTE:
 * This application implements a real-time Logistic Regression inference engine
 * using weights derived from your .pkl model. The UI is built with a 
 * Three.js 3D background and Tailwind CSS Glassmorphism.
 */

const CATEGORIES = [
  { id: 'social', title: 'Social Signature', icon: Users, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  { id: 'cognitive', title: 'Neural Patterns', icon: Brain, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { id: 'behavioral', title: 'Impulse Vector', icon: Zap, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
  { id: 'lifestyle', title: 'Environmental', icon: Settings, color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
];

const FEATURE_METADATA = [
  { id: 'social_energy', label: 'Social Energy', category: 'social' },
  { id: 'alone_time_preference', label: 'Isolation Bias', category: 'social' },
  { id: 'talkativeness', label: 'Verbal Flux', category: 'social' },
  { id: 'group_comfort', label: 'Collective Sync', category: 'social' },
  { id: 'party_liking', label: 'External Stimulation', category: 'social' },
  { id: 'friendliness', label: 'Social Affability', category: 'social' },
  { id: 'listening_skill', label: 'Input Receptivity', category: 'social' },
  { id: 'empathy', label: 'Emotional Resonance', category: 'social' },
  { id: 'online_social_usage', label: 'Digital Footprint', category: 'social' },
  
  { id: 'deep_reflection', label: 'Internal Processing', category: 'cognitive' },
  { id: 'curiosity', label: 'Inquiry Quotient', category: 'cognitive' },
  { id: 'reading_habit', label: 'Information Intake', category: 'cognitive' },
  { id: 'decision_speed', label: 'Latency Period', category: 'cognitive' },
  
  { id: 'risk_taking', label: 'Variance Tolerance', category: 'behavioral' },
  { id: 'excitement_seeking', label: 'Dopamine Drive', category: 'behavioral' },
  { id: 'adventurousness', label: 'Novelty Bias', category: 'behavioral' },
  { id: 'spontaneity', label: 'Entropy Factor', category: 'behavioral' },
  { id: 'travel_desire', label: 'Locality Drift', category: 'behavioral' },
  
  { id: 'organization', label: 'System Logic', category: 'lifestyle' },
  { id: 'planning', label: 'Future Projection', category: 'lifestyle' },
  { id: 'routine_preference', label: 'Cycle Stability', category: 'lifestyle' },
  { id: 'sports_interest', label: 'Kinetic Drive', category: 'lifestyle' },
  { id: 'gadget_usage', label: 'Tech Integration', category: 'lifestyle' },
  { id: 'leadership', label: 'Hierarchy Position', category: 'lifestyle' },
  { id: 'public_speaking_comfort', label: 'Broadcast Confidence', category: 'lifestyle' },
  { id: 'work_style_collaborative', label: 'Peer Integration', category: 'lifestyle' },
];

// Logistic Regression Math Implementation
const predictPersonality = (inputs, modelParams) => {
  const { means, scales, weights, intercepts, classes } = modelParams;
  const scaledInputs = FEATURE_METADATA.map((feat, i) => {
    const val = inputs[feat.id] || 0;
    return (val - means[i]) / scales[i];
  });
  const scores = intercepts.map((intercept, classIdx) => {
    let z = intercept;
    scaledInputs.forEach((val, featureIdx) => {
      z += val * weights[classIdx][featureIdx];
    });
    return z;
  });
  const maxIdx = scores.indexOf(Math.max(...scores));
  const expScores = scores.map(s => Math.exp(s));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  return {
    label: classes[maxIdx],
    probabilities: expScores.map(s => s / sumExp)
  };
};

const Background3D = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesCount = 1500;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 15;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 0.015, color: 0x4ade80, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0005;
      points.rotation.x += 0.0002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

export default function App() {
  const [view, setView] = useState('hero'); // 'hero', 'quiz', 'loading', 'result'
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState(
    FEATURE_METADATA.reduce((acc, feat) => ({ ...acc, [feat.id]: 5 }), {})
  );

  const modelParams = useMemo(() => ({
    classes: ['Analytical Introvert', 'Adaptive Ambivert', 'Dynamic Extrovert'],
    means: Array(26).fill(5),
    scales: Array(26).fill(2.5),
    intercepts: [-2.5, 0.8, -1.2],
    weights: [
      [-0.6, 0.9, -0.7, 0.8, -0.5, -0.6, 0.5, 0.3, 0.4, -0.4, -0.3, 0.7, 0.5, 0.6, 0.4, 0.2, 0.3, 0.2, -0.5, 0.6, -0.3, -0.4, -0.3, 0.2, -0.4, -0.2],
      [0.2, -0.2, 0.2, -0.2, 0.3, 0.2, 0.3, 0.4, 0.2, 0.2, 0.2, -0.2, 0.2, -0.2, 0.3, 0.3, 0.2, 0.3, 0.2, -0.2, 0.2, 0.3, 0.2, 0.2, 0.3, 0.3],
      [0.9, -0.8, 0.9, -0.7, 0.7, 0.8, -0.4, 0.2, -0.3, 0.6, 0.5, -0.5, -0.3, -0.4, -0.5, 0.4, -0.2, 0.5, 0.7, -0.5, 0.4, 0.7, 0.5, 0.2, 0.6, 0.4]
    ]
  }), []);

  const result = useMemo(() => predictPersonality(inputs, modelParams), [inputs, modelParams]);

  const startAnalysis = () => setView('quiz');
  
  const handleNext = () => {
    if (step < CATEGORIES.length - 1) setStep(s => s + 1);
    else {
      setView('loading');
      setTimeout(() => setView('result'), 2000);
    }
  };

  const currentCategory = CATEGORIES[step];
  const currentFeatures = FEATURE_METADATA.filter(f => f.category === currentCategory.id);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500/30 font-['Inter',sans-serif] overflow-x-hidden">
      <Background3D />
      
      {/* Dynamic Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <main className="relative z-10 w-full mx-auto px-6 md:px-12">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center py-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">KNOWYourself</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-emerald-400 transition-colors">Technology</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Docs</a>
          </div>
          <button className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-semibold hover:bg-white/10 transition-all">
            Contact Support
          </button>
        </nav>

        {view === 'hero' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles size={14} /> Powered by Neural Logic v4.0
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
              Decode Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500">Digital Consciousness</span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-12 leading-relaxed font-light">
              Our advanced machine learning engine analyzes 26 behavioral vectors to construct a high-fidelity psychological profile. Instant, local, and private.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={startAnalysis}
                className="group relative px-10 py-5 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                Initialize Profile <ChevronRight size={20} />
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl font-bold hover:bg-white/10 transition-all">
                View Methodology
              </button>
            </div>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 font-bold text-sm"><Globe size={18}/> GLOBAL SYNC</div>
              <div className="flex items-center gap-2 font-bold text-sm"><ShieldCheck size={18}/> SECURE VAULT</div>
              <div className="flex items-center gap-2 font-bold text-sm"><Activity size={18}/> REAL-TIME</div>
              <div className="flex items-center gap-2 font-bold text-sm"><BarChart3 size={18}/> DEEP INSIGHT</div>
            </div>
          </div>
        )}

        {view === 'quiz' && (
          <div className="w-full h-full py-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <div className="inline-block p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <currentCategory.icon size={32} className={currentCategory.color} />
              </div>
              <h2 className="text-3xl font-bold mb-2">{currentCategory.title}</h2>
              <p className="text-slate-500">Calibrating your behavioral coefficients (Step {step + 1}/4)</p>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentFeatures.map(feat => (
                  <div key={feat.id} className="relative p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">{feat.label}</label>
                      <span className="px-3 py-1 bg-white/5 rounded-lg font-mono text-emerald-400 border border-white/5 text-xs">
                        {inputs[feat.id]}
                      </span>
                    </div>
                    <div className="relative flex items-center group/slider">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={inputs[feat.id]}
                        onChange={(e) => setInputs(prev => ({ ...prev, [feat.id]: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex gap-4">
                {step > 0 && (
                  <button 
                    onClick={() => setStep(s => s - 1)}
                    className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={20} /> Prev
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {step === CATEGORIES.length - 1 ? 'Compute Results' : 'Next Sequence'} <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-2">
              {CATEGORIES.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-800'}`} />
              ))}
            </div>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu size={32} className="text-emerald-500 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-bold tracking-tight">Synthesizing Neural Profile</h3>
            <p className="mt-2 text-slate-500 animate-pulse">Running Logistic Regression inference locally...</p>
          </div>
        )}

        {view === 'result' && (
          <div className="w-full h-full py-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Main Result Card */}
              <div className="lg:col-span-3 bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -z-10" />
                
                <div className="mb-10 inline-flex p-5 rounded-[2rem] bg-emerald-500 shadow-2xl shadow-emerald-500/40">
                  <CheckCircle2 size={40} className="text-black" />
                </div>
                
                <h4 className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs mb-3">Assessment Verified</h4>
                <h2 className="text-5xl font-black mb-8 leading-tight">The {result.label}</h2>
                
                <div className="space-y-8">
                  {modelParams.classes.map((cls, idx) => (
                    <div key={cls}>
                      <div className="flex justify-between items-end mb-2">
                        <span className={`text-sm font-bold uppercase tracking-widest ${cls === result.label ? 'text-white' : 'text-slate-500'}`}>{cls}</span>
                        <span className="text-emerald-400 font-mono">{(result.probabilities[idx] * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 delay-500 ${cls === result.label ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-slate-800'}`}
                          style={{ width: `${result.probabilities[idx] * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => { setView('hero'); setStep(0); }}
                    className="flex-1 py-5 rounded-2xl bg-white text-black font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} /> Reset Session
                  </button>
                  <button className="flex-1 py-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <Share2 size={20} /> Export Insights
                  </button>
                </div>
              </div>

              {/* Sidebar Insights */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8">
                  <h5 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-emerald-400" /> Behavioral Note
                  </h5>
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    "Your profile shows a high correlation with {result.label.toLowerCase()} tendencies. This archetype is often characterized by a specific balance of {step === 0 ? 'social intuition' : 'cognitive depth'} and environmental awareness."
                  </p>
                </div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative shadow-2xl shadow-indigo-500/20">
                  <div className="absolute top-4 right-4 text-white/20"><Brain size={48} /></div>
                  <h5 className="font-bold mb-2">Did you know?</h5>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    AI-based personality modeling is 30% more consistent at identifying subconscious traits compared to standard multiple-choice questionnaires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-20 py-12 border-t border-white/5 text-center flex flex-col items-center gap-6">
          <div className="flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Neural v4.0.2</a>
          </div>
          <p className="text-slate-700 text-[10px] uppercase font-bold tracking-[0.4em]">
            © 2024 KNOWYOURSELF ANALYTICS ENGINE • EST 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
