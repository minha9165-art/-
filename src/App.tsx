import { useState, useRef, ChangeEvent } from "react";
import { 
  Camera, 
  Upload, 
  Loader2, 
  Palette, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Scissors,
  Shirt,
  Info,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ColorItem {
  name: string;
  hex: string;
  reason: string;
}

interface AnalysisResult {
  disclaimer: string;
  summary: string;
  tone_direction: "warm" | "cool" | "neutral";
  season_type: string;
  sub_type: string;
  confidence: number;
  analysis: {
    skin_tone: string;
    brightness: string;
    saturation: string;
    contrast: string;
    overall_impression: string;
  };
  recommended_colors: ColorItem[];
  avoid_colors: ColorItem[];
  makeup_recommendations: {
    lip: string[];
    blush: string[];
    eyeshadow: string[];
  };
  hair_recommendations: string[];
  fashion_recommendations: string[];
  style_tip: string;
  photo_quality_note: string;
}

export default function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2D2926] font-sans selection:bg-[#E8E4DE]">
      {/* Navigation */}
      <nav className="border-b border-[#E8E4DE] bg-[#FDFCF9]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1024px] mx-auto px-12 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-black rounded-full" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Chroma Studio</span>
          </div>
          <div className="hidden sm:flex gap-10 text-[10px] font-semibold tracking-widest uppercase opacity-60">
            <span className="border-b border-black pb-1 cursor-pointer">Personal Report</span>
            <span className="hover:opacity-100 transition-opacity cursor-pointer">Color Palette</span>
            <span className="hover:opacity-100 transition-opacity cursor-pointer">Styling Guide</span>
          </div>
          <div className="hidden sm:block text-xs font-medium italic font-serif">Ref. #2904-JW</div>
        </div>
      </nav>

      <main className="max-w-[1024px] mx-auto min-h-[calc(100vh-120px)] flex flex-col">
        <AnimatePresence mode="wait">
          {!result && !isAnalyzing ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center px-12 py-12"
            >
              <div className="space-y-6 max-w-2xl mb-16">
                <h1 className="text-5xl sm:text-7xl font-serif font-bold italic tracking-tight leading-[1.1]">
                  A scientific approach <br />
                  to <span className="text-[#8EA8C3]">personal aesthetics</span>.
                </h1>
                <p className="text-sm font-medium tracking-widest uppercase opacity-40 max-w-md mx-auto">
                  AI-powered Chromatic Analysis & Editorial Styling Guide
                </p>
              </div>

              {/* Upload Section */}
              <div className="w-full max-w-lg mb-16">
                <div 
                  className={`relative group aspect-[4/3] border border-[#E8E4DE] rounded-sm flex flex-col items-center justify-center transition-all duration-500 overflow-hidden bg-[#F5F2EE]/30
                    ${previewUrl ? 'border-black' : 'hover:bg-[#F5F2EE]'}`}
                >
                  {previewUrl ? (
                    <>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover grayscale-[0.2]"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-800 transition-all"
                        >
                          Change Image
                        </button>
                      </div>
                    </>
                  ) : (
                    <div 
                      className="cursor-pointer flex flex-col items-center p-12 text-center w-full h-full justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-white border border-[#E8E4DE] rounded-full flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-black opacity-30" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Upload Portrait</h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-40 leading-relaxed max-w-[240px]">
                        Frontal view under natural light yields the most precise chromatic reading.
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <button
                  disabled={!selectedImage || isAnalyzing}
                  onClick={handleAnalyze}
                  className={`mt-10 w-full py-5 rounded-full font-bold text-[10px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.98]
                    ${selectedImage 
                      ? 'bg-black text-white hover:bg-neutral-800' 
                      : 'bg-[#E8E4DE] text-neutral-400 pointer-events-none'}`}
                >
                  Start Analysis <ChevronRight className="w-4 h-4" />
                </button>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="mt-6 text-rose-500 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-3 h-3" /> {error}
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 w-full border-t border-[#E8E4DE]">
                <div className="p-8 border-r border-[#E8E4DE] last:border-r-0 flex flex-col items-center gap-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8EA8C3]">Metric 01</div>
                  <div className="text-xs font-semibold uppercase tracking-tight">Dermal Mapping</div>
                </div>
                <div className="p-8 border-r border-[#E8E4DE] last:border-r-0 flex flex-col items-center gap-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8EA8C3]">Metric 02</div>
                  <div className="text-xs font-semibold uppercase tracking-tight">Chromatic Sync</div>
                </div>
                <div className="p-8 border-r border-[#E8E4DE] last:border-r-0 flex flex-col items-center gap-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8EA8C3]">Metric 03</div>
                  <div className="text-xs font-semibold uppercase tracking-tight">Styling Protocol</div>
                </div>
              </div>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-12 py-24"
            >
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 border border-[#E8E4DE] rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-t-2 border-black rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-4 overflow-hidden rounded-full grayscale opacity-20">
                  {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" />}
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.4em]">Decoding Aesthetics</h2>
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-serif italic opacity-60">Quantifying your natural elegance...</p>
                </div>
              </div>
            </motion.div>
          ) : result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col md:flex-row overflow-hidden border-t border-[#E8E4DE]"
            >
              {/* Column 1: Profile & Season */}
              <div className="w-full md:w-1/4 p-12 border-b md:border-b-0 md:border-r border-[#E8E4DE] flex flex-col justify-between bg-[#FDFCF9]">
                <div>
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mb-10 group"
                  >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Studio
                  </button>
                  <div className="w-full aspect-[4/5] rounded-[32px] md:rounded-full overflow-hidden border border-[#E8E4DE] bg-[#F5F2EE] mb-10 relative group">
                    <img 
                      src={previewUrl || ""} 
                      alt="Subject" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#E8E4DE]/50 to-transparent"></div>
                  </div>
                  <h2 className="text-[10px] uppercase tracking-widest opacity-40 mb-3 font-bold">Analysis Subject</h2>
                  <p className="text-2xl font-serif italic mb-1">Subject #AI-Studio</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Status: Verified Diagnosis</p>
                </div>

                <div className="mt-12">
                  <div className="p-6 border border-black rounded-sm bg-white">
                    <h3 className="text-[10px] uppercase tracking-widest mb-6 font-bold">Final Protocol</h3>
                    <p className="text-4xl font-serif italic leading-none mb-3">{result.season_type.split(' ')[0]}</p>
                    <p className="text-lg font-serif opacity-70 italic">{result.sub_type}</p>
                    <div 
                      className="mt-6 h-1 w-full" 
                      style={{ backgroundColor: result.recommended_colors[0]?.hex || '#000' }}
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Technical Analysis */}
              <div className="w-full md:w-2/5 p-12 border-b md:border-b-0 md:border-r border-[#E8E4DE] flex flex-col bg-white">
                <h1 className="text-4xl lg:text-5xl font-serif italic leading-[1.1] mb-12">
                  {result.summary.split('.')[0]}.<br />
                  <span className="text-[#8EA8C3]">Refined Spectrum</span>.
                </h1>

                <div className="space-y-10 flex-1">
                  <div className="grid grid-cols-1 gap-8">
                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold mb-3 text-[#8EA8C3]">01. Dermal Profile</h4>
                      <p className="text-[13px] leading-relaxed opacity-70 italic font-medium">{result.analysis.skin_tone}</p>
                    </section>
                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold mb-3 text-[#8EA8C3]">02. Visual Impulse</h4>
                      <p className="text-[13px] leading-relaxed opacity-70 italic font-medium">{result.analysis.overall_impression}</p>
                    </section>
                  </div>

                  <div className="pt-10 border-t border-[#E8E4DE]">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Chromatic Metrics</h4>
                    <div className="space-y-6">
                      {[
                        { label: "Contrast Range", value: result.analysis.contrast },
                        { label: "Saturation Level", value: result.analysis.saturation },
                        { label: "Luminance", value: result.analysis.brightness },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <span className="text-[11px] font-medium opacity-50 uppercase tracking-widest">{item.label}</span>
                          <div className="w-32 h-0.5 bg-[#E8E4DE] relative">
                             <div className="absolute left-1/2 top-[-3px] w-2 h-2 rounded-full bg-black" />
                             <div className="absolute top-4 right-0 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-serif italic whitespace-nowrap">
                               {item.value.split(',')[0]}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-10">
                    <div className="p-6 bg-[#F5F2EE] rounded-sm border border-[#E8E4DE]">
                      <h3 className="text-[10px] uppercase tracking-[0.2em] mb-4 font-bold">Styling Note</h3>
                      <p className="text-[12px] leading-relaxed italic opacity-70">
                        {result.style_tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Palettes */}
              <div className="flex-1 p-12 bg-[#F5F2EE] flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8">Signature Palette</h4>
                  <div className="grid grid-cols-4 gap-3 mb-12">
                    {result.recommended_colors.map((color, idx) => (
                      <div key={idx} className="group relative">
                        <div 
                          className="aspect-square rounded-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-transform group-hover:scale-110"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="absolute top-full left-0 mt-2 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity whitespace-nowrap">
                          {color.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-[#9F4A44]">Avoid (Stress Colors)</h4>
                  <div className="grid grid-cols-5 gap-2 mb-12 grayscale-[0.3]">
                    {result.avoid_colors.map((color, idx) => (
                      <div 
                        key={idx}
                        className="aspect-square rounded-[1px] opacity-60 hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col border-b border-[#E8E4DE] pb-3">
                    <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold mb-2">Cosmetic Logic</span>
                    <span className="text-sm font-serif italic opacity-80">{result.makeup_recommendations.lip[0]} / {result.makeup_recommendations.blush[0]}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#E8E4DE] pb-3">
                    <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold mb-2">Fiber Protocol</span>
                    <span className="text-sm font-serif italic opacity-80">{result.fashion_recommendations[0]} & {result.fashion_recommendations[1]}</span>
                  </div>
                  <div className="flex flex-col border-b border-[#E8E4DE] pb-3">
                    <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold mb-2">Trichology</span>
                    <span className="text-sm font-serif italic opacity-80">{result.hair_recommendations[0]}</span>
                  </div>
                  
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-30 leading-relaxed pt-6">
                    {result.photo_quality_note}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="h-12 bg-black text-white flex items-center">
        <div className="max-w-[1024px] mx-auto w-full px-12 text-[9px] tracking-[0.3em] uppercase flex justify-between font-bold">
          <span>Personalized Aesthetic Protocol</span>
          <span className="opacity-40">Ref: 2904-STUDIO</span>
          <span>© 2026 Chroma Artistry</span>
        </div>
      </footer>
    </div>
  );
}

