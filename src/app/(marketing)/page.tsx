"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileImage,
  FileText,
  Video,
  Music,
  Send,
  Lock,
  QrCode,
  Timer,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/* -------------------------------------------------------------------------- */
/*  MetaConvert — landing                                                      */
/*  Anchored to Dub (dub.co): product-as-hero with a live tool switcher.       */
/*  Warm-white ground, warm ink, one orchestrated signal-orange accent.        */
/*  Secondary anchor Ordalie: numbered claim device on the privacy block.      */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const startHref = session ? "/dashboard" : "/sign-up";

  return (
    <div className="bg-paper text-ink font-sans selection:bg-signal selection:text-paper">
      <Hero startHref={startHref} loggedIn={!!session} />
      <ToolsIndex />
      <TransferShowcase />
      <PrivacyBlock />
      <FinalCta startHref={startHref} />
    </div>
  );
}

function Eyebrow({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "paper" }) {
  return (
    <p
      className={
        "text-[12px] font-semibold uppercase tracking-[0.18em] " +
        (tone === "paper" ? "text-paper/55" : "text-signal")
      }
    >
      {children}
    </p>
  );
}

/* ----------------------------------- Hero --------------------------------- */

function Hero({ startHref, loggedIn }: { startHref: string; loggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-24">
        <div className="min-w-0 max-w-xl">
          <Eyebrow>Dix outils · un seul onglet</Eyebrow>

          <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.02em] text-ink sm:text-[3.4rem] lg:text-[4rem] lg:leading-[0.98]">
            Convertir, transférer,
            <br />
            protéger n&apos;importe
            <br />
            quel <span className="text-signal">fichier</span>.
          </h1>

          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            Image, PDF, vidéo, audio, archives — dix outils dans un onglet.
            Choisissez-en un, il tourne déjà ci-contre. Traité dans le
            navigateur, jamais conservé.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={startHref}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-signal px-7 text-sm font-medium text-paper transition hover:bg-signal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              {loggedIn ? "Tableau de bord" : "Commencer — gratuit"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#outils"
              className="inline-flex h-12 items-center rounded-full border border-ink/20 px-7 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Voir les dix outils
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-6 text-[13px] text-ink-soft">
            {["20+ formats", "AES-256", "RGPD", "100% navigateur"].map((s, i) => (
              <span key={s} className="flex items-center gap-4">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-signal/60" />}
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* The product, live — a switcher across the real tools (Dub signature) */}
        <ToolSwitcher />
      </div>
    </section>
  );
}

/* ----------------------------- Tool switcher ------------------------------ */

const TABS = [
  { key: "image", label: "Image", icon: FileImage },
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "video", label: "Vidéo", icon: Video },
  { key: "audio", label: "Audio", icon: Music },
  { key: "transfer", label: "Transfert", icon: Send },
] as const;

function ToolSwitcher() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="Outils MetaConvert"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((t, i) => {
          const on = i === active;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={[
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal",
                on
                  ? "bg-signal text-paper"
                  : "border border-ink/15 text-ink-soft hover:border-ink hover:text-ink",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" strokeWidth={1.9} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 rounded-[1.4rem] border border-line bg-paper p-5 shadow-[0_30px_70px_-40px_rgba(27,26,23,0.5)] sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {active === 0 && <ImagePanel />}
            {active === 1 && <PdfPanel />}
            {active === 2 && <VideoPanel />}
            {active === 3 && <AudioPanel />}
            {active === 4 && <TransferPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Shared little building blocks */
function FileRow({
  icon: Icon,
  name,
  ext,
  meta,
  tone = "plain",
}: {
  icon: typeof FileImage;
  name: string;
  ext: string;
  meta: string;
  tone?: "plain" | "out";
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-paper-deep px-4 py-3.5">
      <span
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " +
          (tone === "out" ? "bg-signal text-paper" : "bg-ink text-paper")
        }
      >
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-ink">
          {name}
          <span className={tone === "out" ? "text-signal" : "text-ink-soft"}>.{ext}</span>
        </p>
        <p className="text-[13px] tabular-nums text-ink-soft">{meta}</p>
      </div>
    </div>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group mt-5 flex items-center justify-between rounded-2xl border border-ink/15 px-4 py-3 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

function GrowBar({ to, label, value }: { to: string; label: string; value: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-[13px] text-ink-soft">
        <span>{label}</span>
        <span className="font-medium tabular-nums text-ink">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-signal"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: to }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* Image — interactive format conversion (the live moment) */
type Target = { ext: string; size: string; delta: string };
const IMG_TARGETS: Target[] = [
  { ext: "webp", size: "0,34 Mo", delta: "−74%" },
  { ext: "avif", size: "0,22 Mo", delta: "−83%" },
  { ext: "png", size: "2,10 Mo", delta: "−50%" },
  { ext: "jpg", size: "0,61 Mo", delta: "−71%" },
  { ext: "pdf", size: "0,88 Mo", delta: "—" },
];

function ImagePanel() {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(0);
  const [phase, setPhase] = useState<"converting" | "done">("done");
  const [progress, setProgress] = useState(100);
  const raf = useRef<number | null>(null);

  function go(i: number) {
    setSel(i);
    if (reduce) {
      setProgress(100);
      setPhase("done");
      return;
    }
    setPhase("converting");
    setProgress(0);
  }

  useEffect(() => {
    if (phase !== "converting") return;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1000);
      setProgress(Math.round(p * 100));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setPhase("done");
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [phase]);

  const target = IMG_TARGETS[sel];
  const done = phase === "done";

  return (
    <div>
      <FileRow icon={FileImage} name="IMG_2847" ext="heic" meta="4,2 Mo · entrée" />
      <p className="mb-2.5 mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Convertir en
      </p>
      <div className="flex flex-wrap gap-2">
        {IMG_TARGETS.map((t, i) => {
          const on = i === sel;
          return (
            <button
              key={t.ext}
              onClick={() => go(i)}
              aria-pressed={on}
              className={[
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal",
                on ? "bg-signal text-paper" : "border border-ink/15 text-ink-soft hover:border-ink hover:text-ink",
              ].join(" ")}
            >
              {t.ext}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-paper-deep p-4">
        {done ? (
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal text-paper">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-ink">
                IMG_2847.<span className="text-signal">{target.ext}</span>
              </p>
              <p className="text-[13px] tabular-nums text-ink-soft">{target.size} · prêt</p>
            </div>
            {target.delta !== "—" && (
              <span className="rounded-full bg-signal/12 px-2.5 py-1 text-[13px] font-medium tabular-nums text-signal-deep">
                {target.delta}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 py-0.5">
            <div className="flex items-center justify-between text-[13px] text-ink-soft">
              <span>Conversion…</span>
              <span className="font-medium tabular-nums text-ink">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <PanelLink href="/dashboard/image">Ouvrir l&apos;outil image</PanelLink>
    </div>
  );
}

/* PDF — merge pages into one document */
function PdfPanel() {
  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Fusionner les pages
      </p>
      <div className="flex items-center gap-3">
        {["01", "02", "03"].map((n) => (
          <div
            key={n}
            className="flex h-20 w-16 flex-col justify-between rounded-lg border border-line bg-paper-deep p-2"
          >
            <span className="text-[11px] tabular-nums text-ink-soft">{n}</span>
            <span className="space-y-1">
              <span className="block h-1 w-full rounded bg-line" />
              <span className="block h-1 w-3/4 rounded bg-line" />
              <span className="block h-1 w-full rounded bg-line" />
            </span>
          </div>
        ))}
        <ArrowRight className="h-5 w-5 shrink-0 text-signal" />
        <div className="flex h-20 flex-1 items-center justify-center rounded-lg border border-signal/30 bg-signal/[0.06]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal text-paper">
            <FileText className="h-5 w-5" strokeWidth={1.9} />
          </span>
        </div>
      </div>
      <div className="mt-5">
        <FileRow icon={FileText} name="rapport_final" ext="pdf" meta="1,2 Mo · 3 pages · fusionné" tone="out" />
      </div>
      <PanelLink href="/dashboard/pdf-weaver">Ouvrir PDF Weaver</PanelLink>
    </div>
  );
}

/* Vidéo — compress to a smaller codec */
function VideoPanel() {
  return (
    <div>
      <FileRow icon={Video} name="reel_v3" ext="mov" meta="248 Mo · H.264 · entrée" />
      <p className="mb-2.5 mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Compresser en H.265
      </p>
      <div className="rounded-2xl bg-paper-deep p-4">
        <GrowBar to="17%" label="Taille finale" value="41 Mo" />
      </div>
      <div className="mt-3">
        <FileRow icon={Video} name="reel_v3" ext="mp4" meta="41 Mo · −83% · prêt" tone="out" />
      </div>
      <PanelLink href="/dashboard/video">Ouvrir l&apos;outil vidéo</PanelLink>
    </div>
  );
}

/* Audio — extract the track from a video */
function AudioPanel() {
  return (
    <div>
      <FileRow icon={Video} name="interview" ext="mp4" meta="312 Mo · extraire la piste" />
      <div className="mt-5 flex h-16 items-end gap-[3px] rounded-2xl bg-paper-deep px-4 py-3">
        {[7, 13, 9, 18, 24, 16, 28, 20, 30, 22, 14, 26, 12, 19, 9, 23, 15, 8, 21, 11, 17, 25, 10, 6].map(
          (h, i) => (
            <span
              key={i}
              className="w-full rounded-full bg-signal/70"
              style={{ height: `${h * 3}%` }}
            />
          )
        )}
      </div>
      <div className="mt-3">
        <FileRow icon={Music} name="interview" ext="mp3" meta="3,4 Mo · 320 kbps · prêt" tone="out" />
      </div>
      <PanelLink href="/dashboard/audio">Ouvrir l&apos;outil audio</PanelLink>
    </div>
  );
}

/* Transfert — a secure, expiring link */
function TransferPanel() {
  return (
    <div>
      <FileRow icon={Send} name="Projet_Archi" ext="zip" meta="1,4 Go · 3 fichiers" />
      <div className="mt-5 rounded-2xl bg-paper-deep p-4">
        <GrowBar to="89%" label="Envoi chiffré" value="89%" />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-ink/20 px-4 py-3">
        <span className="truncate text-[14px] text-ink-soft">metaconvert.app/t/x7k29q</span>
        <span className="ml-3 flex shrink-0 items-center gap-2 text-[12px] text-ink-soft">
          <Timer className="h-3.5 w-3.5 text-signal" /> expire dans 7 j
        </span>
      </div>
      <PanelLink href="/dashboard/transfer">Ouvrir le transfert</PanelLink>
    </div>
  );
}

/* ------------------------------ Tools index ------------------------------- */

type Tool = { n: string; name: string; desc: string; formats: string; href: string };

const TOOLS: Tool[] = [
  { n: "01", name: "Image", desc: "Convertir, upscaler, nettoyer les métadonnées EXIF", formats: "PNG · WEBP · AVIF · HEIC · RAW", href: "/dashboard/image" },
  { n: "02", name: "PDF", desc: "Fusionner, diviser, compresser, sécuriser", formats: "PDF · PNG · JPG · TXT", href: "/dashboard/pdf" },
  { n: "03", name: "PDF Weaver", desc: "Éditeur visuel en glisser-déposer, page par page", formats: "PDF", href: "/dashboard/pdf-weaver" },
  { n: "04", name: "Vidéo", desc: "Convertir, compresser, extraire, créer des GIF", formats: "MP4 · MOV · WEBM · GIF", href: "/dashboard/video" },
  { n: "05", name: "Audio", desc: "Extraire la piste, couper, générer un spectrogramme", formats: "MP3 · WAV · FLAC", href: "/dashboard/audio" },
  { n: "06", name: "Web Capture", desc: "Page web en PDF/PNG, téléchargeur vidéo & audio", formats: "PDF · PNG · MP4", href: "/dashboard/web" },
  { n: "07", name: "Archives", desc: "ZIP chiffré AES-256, mot de passe natif Windows", formats: "ZIP · 7Z · RAR", href: "/dashboard/archive" },
  { n: "08", name: "Transfert", desc: "Lien de partage éphémère, jusqu'à 2 Go", formats: "Lien · QR", href: "/dashboard/transfer" },
  { n: "09", name: "Demandes", desc: "Liens de dépôt publics pour recevoir des fichiers", formats: "Dépôt", href: "/dashboard/drop" },
  { n: "10", name: "Cloud", desc: "Historique, stockage perso et coffre MetaVault", formats: "Sync · Coffre", href: "/dashboard/cloud" },
];

function ToolsIndex() {
  return (
    <section id="outils" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>L&apos;index des outils</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-[2rem] font-bold leading-tight tracking-[-0.015em] text-ink sm:text-[2.6rem]">
              Dix outils chirurgicaux, pas une boîte à outils en désordre.
            </h2>
          </div>
          <p className="max-w-xs text-[15px] leading-relaxed text-ink-soft">
            Chaque outil ne fait qu&apos;une chose, parfaitement — et garde les
            formats que vous utilisez vraiment.
          </p>
        </div>

        <ul className="mt-12 border-t border-line">
          {TOOLS.map((t) => (
            <li key={t.n}>
              <Link
                href={t.href}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-5 gap-y-2 border-b border-line py-6 transition-colors hover:bg-paper-deep focus-visible:bg-paper-deep focus-visible:outline-none sm:grid-cols-[3rem_13rem_1fr_auto] sm:items-center sm:px-2"
              >
                <span className="font-display text-lg font-semibold tabular-nums text-signal">{t.n}</span>
                <span className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.6rem]">
                  {t.name}
                </span>
                <span className="col-start-2 row-start-2 text-[15px] text-ink-soft sm:col-start-3 sm:row-start-1">
                  {t.desc}
                </span>
                <span className="col-span-3 flex items-center justify-between gap-4 pt-1 sm:col-span-1 sm:justify-end sm:pt-0">
                  <span className="text-[13px] uppercase tracking-wide text-ink-soft/80 transition-colors group-hover:text-signal">
                    {t.formats}
                  </span>
                  <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-ink-soft opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink group-hover:opacity-100 sm:block" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------- Transfer showcase --------------------------- */

function TransferShowcase() {
  return (
    <section id="transfert" className="border-b border-line bg-paper-deep">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div className="max-w-lg">
          <Eyebrow>MetaTransfer</Eyebrow>
          <h2 className="mt-4 font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.015em] text-ink sm:text-5xl">
            Envoyez 2 Go. Le lien
            <br />
            expire <span className="text-signal">tout seul.</span>
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            Un lien propre, un mot de passe optionnel, un QR code et une date
            d&apos;expiration. Vos destinataires reçoivent les fichiers sans créer
            de compte.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-8">
            <Feat icon={ShieldCheck} term="Chiffré" desc="AES-256 au repos" />
            <Feat icon={Timer} term="Éphémère" desc="Jusqu'à 30 jours" />
            <Feat icon={QrCode} term="QR code" desc="Partage en un scan" />
            <Feat icon={Lock} term="Verrouillé" desc="Mot de passe au choix" />
          </dl>

          <Link
            href="/dashboard/transfer"
            className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-sm font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Ouvrir le transfert
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="relative">
          <div className="rounded-[1.6rem] border border-ink/70 bg-ink p-7 shadow-[0_40px_80px_-44px_rgba(27,26,23,0.6)]">
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-medium text-paper/75">Lien de réception</span>
              <span className="flex items-center gap-2 text-[12px] text-paper/55">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" /> en attente
              </span>
            </div>
            <div className="mt-6 flex items-center justify-center rounded-2xl border border-paper/10 bg-paper/[0.04] p-6">
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-4 w-4 rounded-[3px] " +
                      ([0, 1, 2, 5, 7, 10, 12, 14, 17, 19, 22, 23, 24, 6, 18].includes(i)
                        ? "bg-paper"
                        : "bg-paper/15")
                    }
                  />
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-paper/15 px-4 py-3">
              <span className="truncate text-[14px] text-paper/60">metaconvert.app/r/dépôt-client</span>
              <span className="ml-3 shrink-0 rounded-full bg-signal px-3 py-1 text-[12px] font-medium text-paper">
                Copier
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feat({ icon: Icon, term, desc }: { icon: typeof ShieldCheck; term: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-signal" strokeWidth={1.75} />
      <div>
        <dt className="text-[15px] font-medium text-ink">{term}</dt>
        <dd className="mt-0.5 text-[14px] text-ink-soft">{desc}</dd>
      </div>
    </div>
  );
}

/* ----------- Privacy — dark block, Ordalie-style numbered claims ----------- */

const CLAIMS = [
  "Traitement éphémère côté serveur, puis suppression immédiate.",
  "Chiffrement en transit et AES-256 pour les archives.",
  "Aucun log de contenu, aucune revente de données.",
  "Conçu selon les standards RGPD européens.",
];

function PrivacyBlock() {
  return (
    <section id="confidentialite" className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-14 px-6 py-20 lg:grid-cols-[1fr_0.85fr] lg:py-28">
        <div className="max-w-xl">
          <Eyebrow tone="paper">Confidentialité</Eyebrow>
          <h2 className="mt-5 font-display text-[2.8rem] font-bold leading-[1] tracking-[-0.02em] sm:text-6xl">
            Traités. Puis <span className="text-signal">supprimés.</span>
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-paper/70">
            MetaConvert est conçu sans rétention. Vos fichiers servent à une seule
            chose — l&apos;opération que vous demandez — puis disparaissent.
          </p>
        </div>

        <ol className="space-y-px lg:mt-2">
          {CLAIMS.map((c, i) => (
            <li
              key={c}
              className="flex items-baseline gap-4 border-t border-paper/15 py-5 text-[15px] leading-snug text-paper/85"
            >
              <span className="font-display text-[15px] font-semibold tabular-nums text-signal">
                0{i + 1}
              </span>
              {c}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA -------------------------------- */

function FinalCta({ startHref }: { startHref: string }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
        <h2 className="mx-auto max-w-3xl font-display text-[2.6rem] font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl">
          Votre prochain fichier
          <br />
          n&apos;attend que <span className="text-signal">vous.</span>
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={startHref}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-signal px-8 text-sm font-medium text-paper transition hover:bg-signal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Commencer — gratuit
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#outils"
            className="text-sm font-medium text-ink-soft underline decoration-line underline-offset-[6px] transition hover:text-ink hover:decoration-ink"
          >
            ou parcourir les outils
          </a>
        </div>
      </div>
    </section>
  );
}
