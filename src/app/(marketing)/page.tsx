"use client";

/**
 * MetaConvert — landing page.
 *
 * Signature (anti-slop) plan, anchored to Dub (product-as-hero, warm-paper ground,
 * one signal-orange accent, honest proof) + Dropship (the tool suite IS the signature):
 *   Tier 1 — (1) a real interactive converter in the hero that reacts to the file you
 *            actually drop; (2) the ten-tool suite as one owned collection; (3) PDF Weaver
 *            shown by real drag-to-reorder, and a live ephemeral-link QR.
 *   Tier 2 — bento with genuinely different cells, a marquee of REAL supported formats
 *            (honest proof, not fake logos), FAQ with concrete answers, one full-bleed
 *            colour block for rhythm.
 *   Recurring motif — the brand double-arrow (convert) in signal between every source→target.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Reorder,
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  ArrowUpRight,
  UploadCloud,
  Check,
  Download,
  Lock,
  ShieldCheck,
  Trash2,
  Image as ImageIcon,
  FileText,
  Layers,
  Video,
  Music,
  Globe,
  Archive,
  Send,
  FolderUp,
  Cloud,
  Plus,
  Minus,
  GripVertical,
  Sparkles,
  RefreshCw,
  Link2,
  Copy,
} from "lucide-react";

/* ----------------------------------------------------------------------------
 * Shared bits
 * ------------------------------------------------------------------------- */

/** The brand mark idea: two opposing arrows = conversion. The recurring
 *  source→target connector throughout the page. */
function ConvertArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 9h13M17 9l-4-4M17 9l-4 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 15H7M7 15l4-4M7 15l4 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}

function Eyebrow({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "paper";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] " +
        (tone === "paper" ? "text-paper/60" : "text-ink-soft")
      }
    >
      <span className="h-1.5 w-1.5 rounded-[2px] bg-signal" />
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Converter widget — the product-as-hero. Reacts to the real dropped file.
 * ------------------------------------------------------------------------- */

type FamKey = "image" | "pdf" | "video" | "audio" | "file";

const FAMILIES: Record<
  FamKey,
  { label: string; exts: string[]; targets: string[] }
> = {
  image: {
    label: "Image",
    exts: ["png", "jpg", "jpeg", "webp", "avif", "heic", "heif", "gif", "bmp", "tif", "tiff", "psd", "raw", "cr2", "nef", "arw", "svg"],
    targets: ["PNG", "WEBP", "AVIF", "JPG", "PDF"],
  },
  pdf: {
    label: "Document",
    exts: ["pdf"],
    targets: ["PNG", "JPG", "WEBP", "TXT"],
  },
  video: {
    label: "Vidéo",
    exts: ["mp4", "mov", "avi", "mkv", "webm", "flv", "m4v"],
    targets: ["MP4", "WEBM", "GIF", "MP3"],
  },
  audio: {
    label: "Audio",
    exts: ["mp3", "wav", "flac", "aac", "ogg", "m4a", "aiff"],
    targets: ["MP3", "WAV", "OGG", "AAC"],
  },
  file: {
    label: "Fichier",
    exts: [],
    targets: ["PDF", "PNG", "ZIP"],
  },
};

const SIZE_FACTOR: Record<string, number> = {
  PNG: 1.05, WEBP: 0.42, AVIF: 0.3, JPG: 0.55, PDF: 0.9, TXT: 0.04,
  MP4: 0.85, WEBM: 0.58, GIF: 1.32, MP3: 0.12, WAV: 1.6, OGG: 0.11,
  AAC: 0.1, ZIP: 0.7,
};

function familyFor(ext: string): FamKey {
  for (const key of ["image", "pdf", "video", "audio"] as FamKey[]) {
    if (FAMILIES[key].exts.includes(ext)) return key;
  }
  return "file";
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${Math.max(1, Math.round(bytes))} o`;
}

type FileState = { name: string; size: number; ext: string; fam: FamKey };

function Converter() {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Seed with a believable, already-converted example so the hero demonstrates
  // the product instantly — dropping a real file replaces it.
  const [file, setFile] = useState<FileState>({
    name: "photo-vacances.heic",
    size: 4_613_734,
    ext: "heic",
    fam: "image",
  });
  const [target, setTarget] = useState("PNG");
  const [phase, setPhase] = useState<"converting" | "done">("done");
  const [progress, setProgress] = useState(100);
  const [dragOver, setDragOver] = useState(false);

  const targets = FAMILIES[file.fam].targets;

  const run = useCallback(
    (tgt: string) => {
      if (timer.current) clearInterval(timer.current);
      setTarget(tgt);
      if (reduce) {
        setProgress(100);
        setPhase("done");
        return;
      }
      setPhase("converting");
      setProgress(0);
      let p = 0;
      timer.current = setInterval(() => {
        p += Math.random() * 16 + 7;
        if (p >= 100) {
          p = 100;
          if (timer.current) clearInterval(timer.current);
          setProgress(100);
          setPhase("done");
        } else {
          setProgress(p);
        }
      }, 75);
    },
    [reduce]
  );

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );

  const ingest = useCallback(
    (f: File) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      const fam = familyFor(ext);
      setFile({ name: f.name, size: f.size, ext, fam });
      run(FAMILIES[fam].targets[0]);
    },
    [run]
  );

  const resultName =
    file.name.replace(/\.[^.]+$/, "") + "." + target.toLowerCase();
  const resultSize = Math.max(2048, file.size * (SIZE_FACTOR[target] ?? 0.6));

  return (
    <div className="relative w-full max-w-md">
      {/* soft halo behind the card — single elevation language */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-signal/10 blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_24px_60px_-32px_rgba(27,26,23,0.45)]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2 font-mono text-[12px] font-medium tracking-tight text-ink">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            convertisseur
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            {FAMILIES[file.fam].label}
          </span>
        </div>

        {/* dropzone */}
        <div className="p-5">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) ingest(f);
            }}
            className={
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-7 text-center transition-colors " +
              (dragOver
                ? "border-signal bg-signal-soft"
                : "border-line bg-paper-deep/50 hover:border-signal/50 hover:bg-paper-deep")
            }
          >
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) ingest(f);
              }}
            />
            <UploadCloud
              className={"h-6 w-6 " + (dragOver ? "text-signal" : "text-ink-soft")}
              strokeWidth={1.6}
            />
            <span className="text-sm font-medium text-ink">Déposez un fichier</span>
            <span className="font-mono text-[11px] text-ink-soft">
              ou cliquez pour parcourir
            </span>
          </label>

          {/* source → target */}
          <div className="mt-5 flex items-center gap-3">
            <div className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2.5">
              <p className="truncate text-[13px] font-medium text-ink">{file.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
                {file.ext.toUpperCase()} · {formatSize(file.size)}
              </p>
            </div>
            <ConvertArrow className="h-5 w-5 shrink-0 text-signal" />
            <div className="rounded-lg bg-ink px-3 py-2.5 text-paper">
              <p className="font-mono text-[13px] font-semibold leading-none">
                .{target.toLowerCase()}
              </p>
            </div>
          </div>

          {/* target chips */}
          <div className="mt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              convertir vers
            </p>
            <div className="flex flex-wrap gap-2">
              {targets.map((t) => {
                const active = t === target;
                return (
                  <button
                    key={t}
                    onClick={() => run(t)}
                    className={
                      "rounded-md border px-2.5 py-1 font-mono text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper " +
                      (active
                        ? "border-signal bg-signal text-paper"
                        : "border-line bg-paper text-ink-soft hover:border-ink/30 hover:text-ink")
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* progress / result */}
          <div className="mt-5 rounded-xl border border-line bg-paper-deep/40 p-4">
            {phase === "converting" ? (
              <>
                <div className="flex items-center justify-between font-mono text-[11px] text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    conversion…
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-signal transition-[width] duration-75 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/15 text-signal">
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {resultName}
                    </p>
                    <p className="font-mono text-[11px] text-ink-soft">
                      {formatSize(resultSize)} · prêt
                    </p>
                  </div>
                </div>
                <Link
                  href="/sign-up"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <Download className="h-3.5 w-3.5" />
                  Récupérer
                </Link>
              </div>
            )}
          </div>

          <p className="mt-3 text-center font-mono text-[10px] text-ink-soft">
            aperçu en direct · le téléchargement final passe par votre espace
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * The tool suite (Dropship signature: ten distinct modules, one collection)
 * ------------------------------------------------------------------------- */

const TOOLS: {
  icon: typeof ImageIcon;
  name: string;
  blurb: string;
  formats: string[];
  span: string;
  feature?: "image" | "transfer";
}[] = [
  {
    icon: ImageIcon,
    name: "Image",
    blurb:
      "Recadrage, rotation, agrandissement et suppression des métadonnées EXIF / GPS.",
    formats: ["PNG", "WEBP", "AVIF", "HEIC", "PSD", "RAW"],
    span: "lg:col-span-2",
    feature: "image",
  },
  {
    icon: FileText,
    name: "PDF",
    blurb: "PDF vers images ou texte, compression et sécurisation en un clic.",
    formats: ["→ PNG", "→ JPG", "→ TXT"],
    span: "",
  },
  {
    icon: Layers,
    name: "PDF Weaver",
    blurb: "Fusionner, diviser et réordonner vos pages au glisser-déposer.",
    formats: ["démo plus bas ↓"],
    span: "",
  },
  {
    icon: Video,
    name: "Vidéo",
    blurb: "Changez de format, extrayez la piste son ou fabriquez un GIF fluide.",
    formats: ["MP4", "WEBM", "→ GIF", "→ MP3"],
    span: "",
  },
  {
    icon: Music,
    name: "Audio",
    blurb: "Conversion sans perte, plus un spectrogramme animé exporté en vidéo.",
    formats: ["MP3", "WAV", "FLAC", "AAC"],
    span: "",
  },
  {
    icon: Globe,
    name: "Web Downloader",
    blurb:
      "Récupérez une vidéo (MP4) ou son audio (MP3) depuis YouTube, TikTok, Vimeo.",
    formats: ["URL → MP4", "URL → MP3"],
    span: "",
  },
  {
    icon: Send,
    name: "Transfert",
    blurb:
      "Un lien de téléchargement temporaire, QR code intégré, qui expire tout seul.",
    formats: ["lien éphémère", "QR"],
    span: "lg:col-span-2",
    feature: "transfer",
  },
  {
    icon: Archive,
    name: "MetaVault",
    blurb: "Archives ZIP chiffrées AES-256 pour vos données les plus sensibles.",
    formats: ["ZIP · AES-256"],
    span: "",
  },
  {
    icon: FolderUp,
    name: "Demandes",
    blurb:
      "Créez un lien de dépôt public pour recevoir des fichiers sans compte tiers.",
    formats: ["lien de dépôt"],
    span: "",
  },
  {
    icon: Cloud,
    name: "Mon Cloud",
    blurb:
      "L'historique complet de vos conversions, avec prévisualisation et re-téléchargement.",
    formats: ["historique", "aperçu"],
    span: "",
  },
];

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const Icon = tool.icon;
  return (
    <div
      className={
        "group flex flex-col rounded-2xl border border-line bg-paper p-6 transition-colors hover:border-ink/25 " +
        tool.span
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-paper transition-colors group-hover:bg-signal">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
          {tool.name}
        </h3>
      </div>

      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
        {tool.blurb}
      </p>

      {tool.feature === "image" && (
        <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-ink-soft">
          <span className="rounded-md border border-line px-2 py-1">×2</span>
          <span className="rounded-md border border-line px-2 py-1">×4</span>
          <span className="text-ink-soft/70">agrandissement intelligent</span>
        </div>
      )}
      {tool.feature === "transfer" && (
        <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-line bg-paper-deep/50 px-3 py-2 font-mono text-[11px] text-ink-soft">
          <QRCodeSVG
            value="https://metaconvert.app/t/demo"
            size={34}
            fgColor="#1B1A17"
            bgColor="transparent"
          />
          <span>
            expire dans 24 h
            <br />
            puis disparaît
          </span>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
        {tool.formats.map((f) => (
          <span
            key={f}
            className="rounded-md bg-paper-deep px-2 py-0.5 font-mono text-[11px] text-ink-soft"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * PDF Weaver — real drag-to-reorder (concrete interaction metaphor, dark beat)
 * ------------------------------------------------------------------------- */

function PdfWeaverDemo() {
  const [pages, setPages] = useState([
    { id: 1, n: "01" },
    { id: 2, n: "02" },
    { id: 3, n: "03" },
    { id: 4, n: "04" },
    { id: 5, n: "05" },
  ]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/45">
          glissez pour réordonner
        </span>
        <span className="font-mono text-[11px] text-paper/60">
          {pages.length} pages · {pages.map((p) => p.n).join(" · ")}
        </span>
      </div>

      <Reorder.Group
        axis="x"
        values={pages}
        onReorder={setPages}
        className="flex flex-wrap gap-3"
      >
        {pages.map((p) => (
          <Reorder.Item
            key={p.id}
            value={p}
            whileDrag={{ scale: 1.06 }}
            className="group/page relative flex aspect-[3/4] w-[74px] cursor-grab flex-col rounded-lg border border-paper/15 bg-paper/[0.06] p-2 backdrop-blur-sm active:cursor-grabbing"
          >
            <div className="flex items-center justify-between">
              <GripVertical className="h-3.5 w-3.5 text-paper/40 transition-colors group-hover/page:text-signal" />
              <span className="font-mono text-[10px] text-paper/60">p.{p.n}</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <span className="block h-1 w-3/4 rounded-full bg-paper/20" />
              <span className="block h-1 w-full rounded-full bg-paper/15" />
              <span className="block h-1 w-2/3 rounded-full bg-paper/15" />
              <span className="block h-1 w-5/6 rounded-full bg-paper/10" />
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Transfer / ephemeral link with a real QR + ticking expiry
 * ------------------------------------------------------------------------- */

function TransferCard() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [secs, setSecs] = useState(24 * 3600 - 1);
  const link = "metaconvert.app/t/8fK2-aZ9";

  useEffect(() => {
    if (reduce) return;
    const i = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, [reduce]);

  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("https://" + link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_-40px_rgba(27,26,23,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ink">
            <Send className="h-4 w-4 text-signal" />
            <span className="font-display text-base font-semibold">
              Lien éphémère
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-ink-soft">
            Partagez un fichier, il s&apos;efface seul.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-paper-deep/40 p-2">
          <QRCodeSVG
            value={"https://" + link}
            size={72}
            fgColor="#1B1A17"
            bgColor="transparent"
          />
        </div>
      </div>

      <button
        onClick={copy}
        className="mt-5 flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-paper-deep/40 px-3.5 py-2.5 text-left transition-colors hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
      >
        <span className="flex items-center gap-2 truncate font-mono text-[13px] text-ink">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
          {link}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[12px] font-medium text-signal">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> copié
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> copier
            </>
          )}
        </span>
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          expire dans
        </span>
        <span className="font-mono text-[15px] font-semibold tabular-nums text-ink">
          {hh}:{mm}:{ss}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * FAQ
 * ------------------------------------------------------------------------- */

const FAQ = [
  {
    q: "Mes fichiers sont-ils vraiment supprimés ?",
    a: "Oui. Les fichiers traités sont effacés des serveurs après conversion. Seules les conversions que vous choisissez de garder restent dans votre espace Cloud, et vous pouvez les supprimer à tout moment.",
  },
  {
    q: "Y a-t-il une limite de taille ?",
    a: "Le traitement se fait côté serveur, donc les fichiers lourds (vidéos, RAW, gros PDF) passent sans bloquer votre navigateur. Les quotas dépendent de votre offre — la version gratuite couvre largement un usage quotidien.",
  },
  {
    q: "Quels formats d'image sont pris en charge ?",
    a: "Plus de vingt, en lecture comme en sortie : PNG, JPG, WEBP, AVIF, HEIC, GIF, BMP, TIFF, SVG, ainsi que les formats lourds PSD et RAW d'appareils photo.",
  },
  {
    q: "Le téléchargement YouTube / TikTok est-il autorisé ?",
    a: "Le Web Downloader est destiné à un usage personnel et au contenu dont vous détenez les droits ou qui est librement réutilisable. Vous restez responsable du respect des conditions des plateformes.",
  },
  {
    q: "Qui peut ouvrir mes archives chiffrées ?",
    a: "Vous seul. MetaVault scelle vos ZIP en AES-256 avec un mot de passe que vous choisissez. Sans ce mot de passe, l'archive est illisible — y compris pour nous.",
  },
  {
    q: "MetaConvert est-il gratuit ?",
    a: "Vous pouvez essayer le convertisseur sans inscription. Créer un compte gratuit débloque l'historique Cloud, les transferts et les dix outils, sans carte bancaire.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
        aria-expanded={open}
      >
        <span className="text-[17px] font-medium text-ink">{q}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-signal">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-soft">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Privacy guarantees (full-bleed colour block — rhythm beat)
 * ------------------------------------------------------------------------- */

const GUARANTEES = [
  {
    n: "01",
    icon: Trash2,
    t: "Suppression automatique",
    d: "Vos fichiers quittent nos serveurs dès le traitement terminé. Rien n'est conservé sans votre accord explicite.",
  },
  {
    n: "02",
    icon: Lock,
    t: "Chiffrement AES-256",
    d: "MetaVault scelle vos archives sensibles avec un chiffrement de niveau bancaire, déverrouillable par vous seul.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    t: "Nettoyage des métadonnées",
    d: "Effacez les données EXIF et GPS de vos images en cochant une case avant de partager.",
  },
];

/* ----------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <Eyebrow>Dix outils · un seul espace cloud</Eyebrow>

            <h1 className="mt-6 font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.025em] text-ink sm:text-6xl lg:text-[4.1rem]">
              Convertissez, éditez et rangez{" "}
              <span className="text-signal">n&apos;importe quel fichier.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Image, PDF, vidéo, audio, archives. MetaConvert remplace la dizaine
              de convertisseurs en ligne que vous gardez en favoris — dans une
              interface propre, traitée dans le cloud puis effacée.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-medium text-paper transition hover:bg-signal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Commencer — gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#outils"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-[15px] font-medium text-ink transition hover:border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              >
                Explorer les outils
              </Link>
            </div>

            <p className="mt-5 font-mono text-[12px] text-ink-soft">
              essai sans inscription · aucune carte requise
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Converter />
          </div>
        </div>
      </section>

      {/* ===================== FORMAT MARQUEE (honest proof) ===================== */}
      <section className="border-b border-line bg-paper-deep/60 py-7">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
            plus de 20 formats pris en charge — voici lesquels
          </p>
        </div>
        <div className="mc-marquee relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-paper-deep to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-paper-deep to-transparent" />
          <div className="mc-marquee-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                {[
                  "PNG", "WEBP", "AVIF", "HEIC", "PSD", "RAW", "SVG", "TIFF",
                  "PDF", "TXT", "MP4", "MOV", "WEBM", "MKV", "MP3", "WAV",
                  "FLAC", "AAC", "GIF", "ZIP",
                ].map((f) => (
                  <span
                    key={f + dup}
                    className="mx-2.5 rounded-lg border border-line bg-paper px-4 py-2 font-mono text-[13px] font-medium text-ink"
                  >
                    {f}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ OUTILS (suite) ============================ */}
      <section id="outils" className="scroll-mt-24 border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>L&apos;atelier</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              Dix outils, une seule logique.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Glisser, choisir le format, récupérer. Le même geste pour une
              photo, un PDF de 200 pages ou une piste audio.
            </p>
          </div>

          <div className="mt-12 grid grid-flow-row-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PDF WEAVER (dark beat, interaction) ===================== */}
      <section className="border-b border-line bg-ink py-20 text-paper lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <Eyebrow tone="paper">PDF Weaver</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-paper sm:text-5xl">
              Vos pages PDF, réordonnées à la main.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/65">
              Un éditeur visuel en glisser-déposer pour fusionner plusieurs
              documents, retirer une page ou inverser l&apos;ordre. L&apos;aperçu
              suit en direct, sans recharger.
            </p>
            <Link
              href="/dashboard/pdf-weaver"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-[15px] font-medium text-paper transition hover:bg-signal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Ouvrir PDF Weaver
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-paper/10 bg-paper/[0.03] p-7">
            <PdfWeaverDemo />
          </div>
        </div>
      </section>

      {/* ===================== TRANSFERT & DÉPÔT ===================== */}
      <section id="transfert" className="scroll-mt-24 border-b border-line py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <Eyebrow>Transfert &amp; dépôt</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              Faites circuler vos fichiers, pas vos données.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              Générez un lien de téléchargement temporaire avec QR code, ou un
              lien de dépôt public pour recevoir des fichiers — sans inscrire vos
              contacts à un service tiers.
            </p>

            <ul className="mt-7 space-y-3 text-[15px] text-ink">
              {[
                "Lien éphémère avec QR code intégré",
                "Expiration automatique, aucune trace",
                "Liens de dépôt pour recevoir sans compte tiers",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal/15 text-signal">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <TransferCard />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONFIDENTIALITÉ (colour block) ===================== */}
      <section
        id="confidentialite"
        className="scroll-mt-24 bg-signal-deep py-20 text-paper lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <Eyebrow tone="paper">Confidentialité</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-paper sm:text-5xl">
              Vos fichiers ne traînent nulle part.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-paper/15 bg-paper/15 sm:grid-cols-3">
            {GUARANTEES.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.n} className="bg-signal-deep p-7">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-paper" strokeWidth={1.7} />
                    <span className="font-mono text-[13px] text-paper/45">{g.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-paper">
                    {g.t}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-paper/70">
                    {g.d}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section className="border-b border-line py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              Tout ce qu&apos;on nous demande avant de commencer.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              Une autre question ?{" "}
              <Link
                href="/contact"
                className="font-medium text-signal underline-offset-4 hover:underline"
              >
                Écrivez-nous
              </Link>
              , on répond vite.
            </p>
          </div>

          <div>
            {FAQ.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="bg-paper-deep/70 py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-4xl font-bold leading-[1.03] tracking-[-0.025em] text-ink sm:text-6xl">
              Glissez votre
              <br />
              <span className="text-signal">premier fichier.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Un compte gratuit, les dix outils, l&apos;historique Cloud. Sans
              carte, sans onglet douteux.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Créer un compte gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#outils"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-soft transition hover:text-ink"
              >
                Revoir les outils
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-dashed border-ink/20 bg-paper p-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper">
                <Sparkles className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <p className="font-display text-lg font-semibold text-ink">
                Déposez ici pour commencer
              </p>
              <p className="font-mono text-[12px] text-ink-soft">
                PNG · PDF · MP4 · MP3 · ZIP · …
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
