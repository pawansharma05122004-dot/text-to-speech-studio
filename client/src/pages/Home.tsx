import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  Download,
  FileAudio,
  Gauge,
  Headphones,
  History,
  Info,
  Languages,
  Loader2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MAX_CHARACTERS = 5000;
const DEFAULT_TEXT = "Welcome to Text-to-Speech Studio. Turn your ideas into natural-sounding narration in seconds.";
const voices = [
  { id: "aria", name: "Aria", language: "English (US)", tone: "Warm · Clear" },
  { id: "liam", name: "Liam", language: "English (US)", tone: "Bright · Confident" },
  { id: "meera", name: "Meera", language: "Hindi", tone: "Natural · Friendly" },
  { id: "elena", name: "Elena", language: "Spanish", tone: "Expressive · Soft" },
];
const languages = ["English (US)", "English (UK)", "Hindi", "Spanish", "French", "German"];

type HistoryItem = { id: string; text: string; voice: string; language: string; speed: number; audioUrl: string; createdAt: number; };

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English (US)");
  const [voice, setVoice] = useState("aria");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);
  const generate = trpc.tts.generate.useMutation();

  const selectedVoice = voices.find((item) => item.id === voice) ?? voices[0];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / (150 * speed / 60)));
  const canGenerate = text.trim().length > 0 && text.length <= MAX_CHARACTERS && !generate.isPending;

  const progressLabel = useMemo(() => `${Math.min(100, Math.round(progress))}%`, [progress]);

  function stopSpeech() {
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    if (timerRef.current) window.clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsSpeaking(false);
    setProgress(0);
  }

  function speak(sourceText = text, historyItem?: HistoryItem) {
    if (audioUrl && sourceText === text) {
      audioRef.current?.play().catch(() => toast.error("Press play again to start the audio preview."));
      return;
    }
    if (!sourceText.trim()) {
      toast.error("Add some text before previewing your narration.");
      return;
    }
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(sourceText);
    utterance.rate = historyItem?.speed ?? speed;
    utterance.pitch = pitch;
    utterance.lang = language.startsWith("Hindi") ? "hi-IN" : language.startsWith("Spanish") ? "es-ES" : language.startsWith("French") ? "fr-FR" : "en-US";
    utterance.onstart = () => { setIsPlaying(true); setIsSpeaking(true); setProgress(2); };
    utterance.onend = () => { setIsPlaying(false); setIsSpeaking(false); setProgress(100); };
    utterance.onerror = () => { setIsPlaying(false); setIsSpeaking(false); toast.error("The browser could not play this narration."); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    timerRef.current = window.setInterval(() => setProgress((value) => Math.min(96, value + 2)), 160);
  }

  async function generateSpeech() {
    if (!text.trim()) { toast.error("Please enter text to narrate."); return; }
    if (text.length > MAX_CHARACTERS) { toast.error(`Please keep your script under ${MAX_CHARACTERS.toLocaleString()} characters.`); return; }
    try {
      const result = await generate.mutateAsync({ text, language, voice: selectedVoice.name, speed, pitch });
      setAudioUrl(result.audioUrl);
      const item = { id: result.requestId, text, voice: selectedVoice.name, language, speed, audioUrl: result.audioUrl, createdAt: Date.now() };
      setHistory((items) => [item, ...items].slice(0, 5));
      setGeneratedAt(Date.now());
      toast.success("Narration is ready to preview.");
      window.setTimeout(() => audioRef.current?.play().catch(() => undefined), 50);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Speech generation failed. Please try again.");
    }
  }

  function downloadAudio() {
    if (!audioUrl) { toast.error("Generate a narration before downloading."); return; }
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "text-to-speech-narration.mp3";
    link.click();
    toast.success("Your narration audio was downloaded.");
  }

  function clearEditor() { stopSpeech(); setText(""); setAudioUrl(null); setGeneratedAt(null); }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark"><Sparkles size={19} strokeWidth={2.5} /></div>
            <div><p className="text-sm font-semibold tracking-[0.18em] text-indigo-700 uppercase">Studio</p><h1 className="-mt-0.5 text-lg font-semibold tracking-tight">Text-to-Speech</h1></div>
          </div>
          <div className="flex items-center gap-2"><Badge className="hidden bg-emerald-50 text-emerald-700 sm:inline-flex"><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />Speech engine ready</Badge><button className="icon-button" aria-label="Help"><CircleHelp size={18} /></button></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:py-12">
        <section className="mb-9 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><div className="eyebrow"><WandSparkles size={15} /> Create a narration</div><h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Give your words a <span className="text-gradient">natural voice.</span></h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">Write, tune, and preview polished narration from one calm workspace. Your next voiceover starts here.</p></div>
          <div className="flex items-center gap-3 text-sm text-slate-500"><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2"><Clock3 size={15} className="text-indigo-600" /> Est. {formatTime(estimatedSeconds)}</div><button className="text-indigo-700 hover:underline" onClick={() => setShowGuide((value) => !value)}>{showGuide ? "Hide guide" : "Show guide"}</button></div>
        </section>

        {showGuide && <div className="guide-banner mb-7"><div className="guide-icon"><Info size={18} /></div><div className="flex-1"><p className="font-semibold text-slate-900">A simple three-step flow</p><p className="mt-1 text-sm leading-6 text-slate-600">Add your script, choose a voice and speaking style, then generate a preview you can replay or download.</p></div><button className="icon-button bg-white/70" onClick={() => setShowGuide(false)} aria-label="Dismiss guide"><X size={16} /></button></div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card className="editor-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><div className="soft-icon"><FileAudio size={18} /></div><div><h3 className="font-semibold">Your script</h3><p className="text-xs text-slate-500">Write or paste your speech-ready text</p></div></div><button className="ghost-button" onClick={clearEditor}><RotateCcw size={15} /> Clear</button></div>
              <div className="p-5 sm:p-7"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={MAX_CHARACTERS} placeholder={DEFAULT_TEXT} aria-label="Narration text" className="script-input" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs"><div className={`${text.length > MAX_CHARACTERS * .9 ? "text-amber-600" : "text-slate-400"}`}>{text.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters <span className="mx-1 text-slate-300">·</span> {wordCount} words</div><div className="flex items-center gap-2 text-slate-400"><Check size={14} className="text-emerald-500" /> Ready for narration</div></div>
                {text.length > MAX_CHARACTERS && <p className="mt-3 text-sm text-rose-600" role="alert">Your script is over the character limit. Shorten it before generating.</p>}
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="flex items-center gap-2 text-xs text-slate-500"><Headphones size={15} className="text-indigo-500" /> Best results come from clear, conversational sentences.</p><Button onClick={generateSpeech} disabled={!canGenerate} className="generate-button">{generate.isPending ? <><Loader2 size={17} className="animate-spin" /> Generating...</> : <><Sparkles size={17} /> Generate speech</>}</Button></div>
            </Card>

            <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7"><div><h3 className="font-semibold">Preview</h3><p className="text-xs text-slate-500">Listen back before you export</p></div>{generatedAt && <Badge className="bg-indigo-50 text-indigo-700">Generated just now</Badge>}</div><div className="p-5 sm:p-7">{generatedAt ? <div className="audio-panel"><div className="flex items-center gap-4"><button className="play-button" onClick={() => isPlaying ? stopSpeech() : speak()} aria-label={isPlaying ? "Pause narration" : "Play narration"}>{isPlaying ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" />}</button><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-900">{selectedVoice.name} · {language}</p><span className="text-xs font-medium text-slate-500">{isSpeaking ? "Playing" : "Ready"}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-100"><div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: progressLabel }} /></div><div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{formatTime(Math.round(estimatedSeconds * progress / 100))}</span><span>{formatTime(estimatedSeconds)}</span></div><input aria-label="Seek narration" className="mt-3 w-full" type="range" min="0" max="100" value={progress} onChange={(event) => { const next = Number(event.target.value); setProgress(next); if (audioRef.current?.duration) audioRef.current.currentTime = audioRef.current.duration * next / 100; }} /><div className="mt-3 flex items-center gap-3 text-xs text-slate-500"><Volume2 size={15} /><input aria-label="Narration volume" className="w-32" type="range" min="0" max="1" step="0.05" defaultValue="1" onChange={(event) => { if (audioRef.current) audioRef.current.volume = Number(event.target.value); }} /><span>Volume</span></div><audio ref={audioRef} src={audioUrl ?? undefined} className="sr-only" onPlay={() => { setIsPlaying(true); setIsSpeaking(true); }} onPause={() => { setIsPlaying(false); setIsSpeaking(false); }} onEnded={() => { setIsPlaying(false); setIsSpeaking(false); setProgress(100); }} onTimeUpdate={(event) => { const element = event.currentTarget; if (element.duration) setProgress(element.currentTime / element.duration * 100); }} /></div></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" className="border-slate-200 bg-white" onClick={() => audioRef.current?.currentTime !== undefined && (audioRef.current.currentTime = 0) || audioRef.current?.play()}><RotateCcw size={15} /> Replay</Button><Button variant="outline" className="border-slate-200 bg-white" onClick={downloadAudio}><Download size={15} /> Download audio</Button></div></div> : <div className="empty-preview"><div className="empty-wave"><Volume2 size={25} /></div><p className="mt-4 font-semibold text-slate-800">Your generated audio will appear here</p><p className="mt-1 max-w-sm text-center text-sm leading-6 text-slate-500">Create a narration to preview your voice, replay it, and export your script.</p></div>}</div></Card>
          </div>

          <aside className="space-y-6">
            <Card className="controls-card"><div className="flex items-center gap-3"><div className="soft-icon"><Gauge size={18} /></div><div><h3 className="font-semibold">Voice settings</h3><p className="text-xs text-slate-500">Tune the feeling of your narration</p></div></div><div className="mt-6 space-y-5"><label className="field-label"><span>Language</span><span className="select-wrap"><Languages size={15} /><select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></span></label><label className="field-label"><span>Voice</span><span className="select-wrap"><Volume2 size={15} /><select value={voice} onChange={(event) => setVoice(event.target.value)}>{voices.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.tone}</option>)}</select><ChevronDown size={15} /></span></label><div><div className="mb-2 flex justify-between"><span className="field-label-text">Speed</span><span className="control-value">{speed.toFixed(1)}×</span></div><input aria-label="Speech speed" type="range" min="0.5" max="1.5" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></div><div><div className="mb-2 flex justify-between"><span className="field-label-text">Pitch</span><span className="control-value">{pitch.toFixed(1)}</span></div><input aria-label="Speech pitch" type="range" min="0.5" max="1.5" step="0.1" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} /></div></div><div className="mt-6 rounded-2xl bg-indigo-50/80 p-4 text-sm text-indigo-900"><div className="flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0 text-indigo-600" /><p className="leading-6">A calm pace around <strong>0.9×–1.1×</strong> works well for most narration.</p></div></div></Card>

            <Card className="history-card"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="soft-icon"><History size={18} /></div><div><h3 className="font-semibold">Recent generations</h3><p className="text-xs text-slate-500">Your latest narration drafts</p></div></div>{history.length > 0 && <span className="text-xs font-semibold text-slate-400">{history.length}/5</span>}</div>{history.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-center"><History size={22} className="mx-auto text-slate-300" /><p className="mt-2 text-sm font-medium text-slate-600">No generations yet</p><p className="mt-1 text-xs leading-5 text-slate-400">Your recent previews will be saved here for quick replay.</p></div> : <div className="mt-5 space-y-2">{history.map((item) => <div key={item.id} className="history-item"><button className="min-w-0 flex-1 text-left" onClick={() => { setText(item.text); setLanguage(item.language); setSpeed(item.speed); setAudioUrl(item.audioUrl); setGeneratedAt(item.createdAt); window.setTimeout(() => audioRef.current?.play().catch(() => undefined), 50); }}><p className="truncate text-sm font-medium text-slate-800">{item.text}</p><p className="mt-1 text-[11px] text-slate-400">{item.voice} · {item.language}</p></button><button className="icon-button" onClick={() => setHistory((items) => items.filter((historyItem) => historyItem.id !== item.id))} aria-label="Remove generation"><Trash2 size={14} /></button></div>)}</div>}</Card>
          </aside>
        </div>
      </main>
      <footer className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 pb-8 text-xs text-slate-400 sm:px-8"><span>Text-to-Speech Studio</span><span className="flex items-center gap-1.5"><LockIcon /> Your writing stays in this workspace</span></footer>
    </div>
  );
}

function LockIcon() { return <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-slate-300 text-[8px]">•</span>; }

