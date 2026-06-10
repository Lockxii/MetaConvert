"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileImage,
  Lock,
  QrCode,
  Timer,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/* -------------------------------------------------------------------------- */
/*  MetaConvert — landing                                                      */
/*  Editorial system (Ordalie + Kanal grounded): warm cream ground, warm ink,  */
/*  one deep cobalt accent, a high-contrast serif (Fraunces) as the voice.     */
/*  Signature: product-as-hero (a live conversion) + an italic-serif accent.   */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const startHref = session ? "/dashboard" : "/sign-up";

  return (
    <div className="bg-paper text-ink font-sans selection:bg-cobalt selection:text-paper">
      <Hero startHref={startHref} loggedIn={!!session} />
      <StatementBand />
      <ToolsIndex />
      <TransferShowcase />
      <PrivacyBlock />
      <FinalCta startHref={startHref} />
    </div>
  );
}

/* Small editorial eyebrow — tracked caps, not monospace */
function Eyebrow({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "paper" }) {
  return (
    <p
      className={
        "text-[11px] font-semibold uppercase tracking-[0.22em] " +
        (tone === "paper" ? "text-paper/60" : "text-cobalt")
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
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
        {/* Left — the argument */}
        <div className="min-w-0 max-w-xl">
          <Eyebrow>Suite fichiers — sans rétention</Eyebrow>

          <h1 className="mt-7 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.015em] text-ink sm:text-6xl lg:text-[4.6rem] lg:leading-[0.98]">
            Convertissez
            <br />
            n&apos;importe quoi.
            <br />
            Ne gardez{" "}
            <span className="italic text-cobalt">rien</span>.
          </h1>

          <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            Image, PDF, vidéo, audio, archives — dix outils dans un seul onglet.
            Traitement instantané, transfert chiffré, et aucun fichier conservé
            sur nos serveurs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={startHref}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-cobalt px-7 text-sm font-medium text-paper transition hover:bg-cobalt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-6 text-[13px] text-ink-soft">
            {["20+ formats", "AES-256", "RGPD", "100% navigateur"].map((s, i) => (
              <span key={s} className="flex items-center gap-4">
                {i > 0 && <span className="h-1 w-1 rounded-full bg-cobalt/50" />}
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Right — the product, live */}
        <Converter />
      </div>
    </section>
  );
}

/* ------------------------------- Converter -------------------------------- */

type Target = { ext: string; size: string; delta: string };

const SOURCE = { name: "IMG_2847", ext: "heic", size: "4,2 Mo" };
const TARGETS: Target[] = [
  { ext: "webp", size: "0,34 Mo", delta: "−74%" },
  { ext: "avif", size: "0,22 Mo", delta: "−83%" },
  { ext: "png", size: "2,10 Mo", delta: "−50%" },
  { ext: "jpg", size: "0,61 Mo", delta: "−71%" },
  { ext: "pdf", size: "0,88 Mo", delta: "—" },
];

function Converter() {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState<"converting" | "done">("done");
  const [progress, setProgress] = useState(100);
  const raf = useRef<number | null>(null);

  function convertTo(i: number) {
    setSelected(i);
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
    const dur = 1050;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setProgress(Math.round(p * 100));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setPhase("done");
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [phase]);

  const target = TARGETS[selected];
  const done = phase === "done";

  return (
    <div className="relative min-w-0">
      <div className="rounded-[1.4rem] border border-line bg-paper p-6 shadow-[0_30px_70px_-36px_rgba(26,22,19,0.45)] sm:p-7">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
            Convertisseur
          </span>
          <span className="font-display text-sm italic text-cobalt">en direct</span>
        </div>

        {/* source */}
        <div className="mt-5 flex items-center gap-3.5 rounded-2xl bg-paper-deep px-4 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-paper">
            <FileImage className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-ink">
              {SOURCE.name}.{SOURCE.ext}
            </p>
            <p className="text-[13px] text-ink-soft">{SOURCE.size} · fichier d&apos;entrée</p>
          </div>
        </div>

        {/* targets */}
        <p className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          Convertir en
        </p>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((t, i) => {
            const active = i === selected;
            return (
              <button
                key={t.ext}
                type="button"
                onClick={() => convertTo(i)}
                aria-pressed={active}
                className={[
                  "rounded-full px-4 py-1.5 text-[13px] font-medium uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt",
                  active
                    ? "bg-cobalt text-paper"
                    : "border border-ink/15 text-ink-soft hover:border-ink hover:text-ink",
                ].join(" ")}
              >
                {t.ext}
              </button>
            );
          })}
        </div>

        {/* output / progress */}
        <div className="mt-6 rounded-2xl bg-paper-deep p-4">
          {done ? (
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cobalt text-paper">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-ink">
                  {SOURCE.name}.<span className="text-cobalt">{target.ext}</span>
                </p>
                <p className="text-[13px] text-ink-soft">{target.size} · prêt</p>
              </div>
              {target.delta !== "—" && (
                <span className="rounded-full bg-cobalt/10 px-2.5 py-1 text-[13px] font-medium text-cobalt-deep">
                  {target.delta}
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 py-0.5">
              <div className="flex items-center justify-between text-[13px] text-ink-soft">
                <span>Conversion…</span>
                <span className="font-medium text-ink">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-cobalt transition-[width] duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/image"
          className="group mt-4 flex items-center justify-between rounded-2xl border border-ink/15 px-4 py-3 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          Ouvrir l&apos;outil image
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ----------------------------- Statement band ----------------------------- */

function StatementBand() {
  return (
    <section className="border-b border-ink/30 bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-14 text-center">
        <p className="font-display text-2xl font-medium leading-snug text-paper sm:text-[2rem]">
          Vingt formats, dix outils,{" "}
          <span className="italic text-paper/55">zéro fichier gardé.</span>
        </p>
      </div>
    </section>
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
            <h2 className="mt-4 max-w-xl font-display text-[2rem] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[2.75rem]">
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
                className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-5 gap-y-2 border-b border-line py-6 transition-colors hover:bg-paper-deep focus-visible:bg-paper-deep focus-visible:outline-none sm:grid-cols-[3rem_14rem_1fr_auto] sm:items-center sm:px-2"
              >
                <span className="font-display text-lg text-cobalt">{t.n}</span>
                <span className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
                  {t.name}
                </span>
                <span className="col-start-2 row-start-2 text-[15px] text-ink-soft sm:col-start-3 sm:row-start-1">
                  {t.desc}
                </span>
                <span className="col-span-3 flex items-center justify-between gap-4 pt-1 sm:col-span-1 sm:justify-end sm:pt-0">
                  <span className="text-[13px] uppercase tracking-wide text-ink-soft/80 transition-colors group-hover:text-cobalt">
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
  const reduce = useReducedMotion();
  return (
    <section id="transfert" className="border-b border-line bg-paper-deep">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div className="max-w-lg">
          <Eyebrow>MetaTransfer</Eyebrow>
          <h2 className="mt-4 font-display text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.01em] text-ink sm:text-5xl">
            Envoyez 2 Go.
            <br />
            Le lien expire <span className="italic text-cobalt">tout seul.</span>
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

        {/* transfer panel — a dark object on the cream ground */}
        <div className="relative">
          <div className="rounded-[1.6rem] border border-ink/70 bg-ink p-7 shadow-[0_40px_80px_-40px_rgba(26,22,19,0.6)]">
            <div className="flex items-center justify-between">
              <span className="font-display text-base italic text-paper/70">Transfert sécurisé</span>
              <span className="flex items-center gap-2 text-[12px] text-paper/55">
                <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                actif
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-paper/10 bg-paper/[0.04] px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cobalt text-paper text-[12px] font-semibold">
                ZIP
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-paper">Projet_Archi_Final.zip</p>
                <p className="text-[13px] text-paper/50">1,4 Go · 3 fichiers</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between text-[13px] text-paper/55">
                <span>Envoi</span>
                <span className="font-medium text-paper">89%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper/10">
                <motion.div
                  className="h-full rounded-full bg-cobalt"
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: "89%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-paper/15 px-4 py-3">
              <span className="truncate text-[14px] text-paper/60">metaconvert.app/t/x7k29q</span>
              <span className="ml-3 shrink-0 rounded-full bg-paper/10 px-3 py-1 text-[12px] font-medium text-paper/75">
                Copier
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feat({
  icon: Icon,
  term,
  desc,
}: {
  icon: typeof ShieldCheck;
  term: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" strokeWidth={1.75} />
      <div>
        <dt className="text-[15px] font-medium text-ink">{term}</dt>
        <dd className="mt-0.5 text-[14px] text-ink-soft">{desc}</dd>
      </div>
    </div>
  );
}

/* ------------------- Privacy — the single full-bleed cobalt ---------------- */

const LIFECYCLE = [
  { label: "Réception", desc: "Le fichier arrive chiffré en transit." },
  { label: "Traitement", desc: "Converti en mémoire, jamais indexé." },
  { label: "Suppression", desc: "Effacé du serveur, rien n'est conservé." },
];

const CLAIMS = [
  "Traitement éphémère côté serveur, suppression immédiate.",
  "Chiffrement en transit et AES-256 pour les archives.",
  "Aucun log de contenu, aucune revente de données.",
  "Conçu selon les standards RGPD européens.",
];

function PrivacyBlock() {
  return (
    <section id="confidentialite" className="bg-cobalt text-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-14 px-6 py-20 lg:grid-cols-[1fr_0.8fr] lg:py-28">
        <div className="max-w-xl">
          <Eyebrow tone="paper">Confidentialité</Eyebrow>
          <h2 className="mt-5 font-display text-[2.8rem] font-semibold leading-[1] tracking-[-0.015em] sm:text-6xl">
            Traités.
            <br />
            Puis <span className="italic">supprimés.</span>
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-paper/75">
            MetaConvert est conçu sans rétention. Vos fichiers servent à une seule
            chose — l&apos;opération que vous demandez — puis disparaissent.
          </p>

          <ol className="mt-10 space-y-px">
            {CLAIMS.map((c, i) => (
              <li
                key={c}
                className="flex items-baseline gap-4 border-t border-paper/15 py-4 text-[15px] leading-snug text-paper/85"
              >
                <span className="font-display text-sm text-paper/55">
                  0{i + 1}
                </span>
                {c}
              </li>
            ))}
          </ol>
        </div>

        {/* lifecycle card */}
        <div className="rounded-[1.5rem] border border-paper/15 bg-paper/[0.06] p-7 lg:mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/55">
            Cycle de vie du fichier
          </p>
          <ol className="mt-6">
            {LIFECYCLE.map((s, i) => (
              <li key={s.label} className="relative flex gap-4 pb-7 last:pb-0">
                {i < LIFECYCLE.length - 1 && (
                  <span className="absolute left-[13px] top-8 h-full w-px bg-paper/20" />
                )}
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-paper/30 font-display text-[13px] text-paper">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <p className="font-display text-lg font-medium text-paper">{s.label}</p>
                  <p className="mt-0.5 text-[14px] text-paper/65">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA -------------------------------- */

function FinalCta({ startHref }: { startHref: string }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
        <h2 className="mx-auto max-w-3xl font-display text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.015em] text-ink sm:text-6xl">
          Votre prochain fichier
          <br />
          n&apos;attend que <span className="italic text-cobalt">vous.</span>
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={startHref}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-cobalt px-8 text-sm font-medium text-paper transition hover:bg-cobalt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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
