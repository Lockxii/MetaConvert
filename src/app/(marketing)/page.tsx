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
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

/* -------------------------------------------------------------------------- */
/*  MetaConvert — landing                                                      */
/*  System: warm paper + warm ink + one electric "volt" accent (= action).     */
/*  Signature: a live file-conversion demo in the hero, and the monospace      */
/*  `.ext` token as the recurring brand atom.                                  */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const startHref = session ? "/dashboard" : "/sign-up";

  return (
    <div className="bg-paper text-ink font-sans selection:bg-volt selection:text-ink">
      <Hero startHref={startHref} loggedIn={!!session} />
      <FormatStrip />
      <ToolsIndex />
      <TransferShowcase />
      <PrivacySection />
      <FinalCta startHref={startHref} />
    </div>
  );
}

/* ----------------------------------- Hero --------------------------------- */

function Hero({ startHref, loggedIn }: { startHref: string; loggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* faint engineering grid, not a gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(#16150F08 1px, transparent 1px), linear-gradient(90deg, #16150F08 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-28">
        {/* Left — the argument */}
        <div className="min-w-0 max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft sm:text-[11px] sm:tracking-[0.18em]">
            <span className="text-volt-deep">//</span> 10 outils · 1 onglet · 0 fichier conservé
          </p>

          <h1 className="mt-6 font-display text-[2.5rem] font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl sm:leading-[0.92] lg:text-7xl">
            Convertissez
            <br />
            n&apos;importe quoi.
            <br />
            Ne gardez{" "}
            <span className="relative inline-block">
              <span className="absolute inset-x-[-0.12em] inset-y-[0.08em] z-0 -skew-x-6 bg-volt" />
              <span className="relative z-10">rien</span>
            </span>
            .
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            Image, PDF, vidéo, audio, archives — dix outils dans un seul onglet.
            Traitement instantané, transfert chiffré, et aucun fichier stocké sur
            nos serveurs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={startHref}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-volt px-7 font-mono text-[13px] font-medium uppercase tracking-wider text-ink ring-1 ring-inset ring-ink/15 transition hover:bg-volt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              {loggedIn ? "Tableau de bord" : "Commencer — gratuit"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#outils"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-7 font-mono text-[13px] uppercase tracking-wider text-ink transition hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              Voir les 10 outils
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            <span>20+ formats</span>
            <span className="text-line">/</span>
            <span>AES-256</span>
            <span className="text-line">/</span>
            <span>RGPD</span>
            <span className="text-line">/</span>
            <span>100% navigateur</span>
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

const SOURCE = { name: "IMG_2847", ext: "HEIC", size: "4.2 Mo" };
const TARGETS: Target[] = [
  { ext: "WEBP", size: "0,34 Mo", delta: "−74%" },
  { ext: "AVIF", size: "0,22 Mo", delta: "−83%" },
  { ext: "PNG", size: "2,10 Mo", delta: "−50%" },
  { ext: "JPG", size: "0,61 Mo", delta: "−71%" },
  { ext: "PDF", size: "0,88 Mo", delta: "—" },
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
      if (p < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setPhase("done");
      }
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
      <div className="rounded-2xl border border-ink/15 bg-paper shadow-[0_30px_60px_-30px_rgba(22,21,15,0.45)]">
        {/* window bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-volt" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            convertisseur · mc
          </span>
        </div>

        <div className="space-y-6 p-6">
          {/* source file */}
          <div className="flex items-center gap-3.5 rounded-xl border border-line bg-paper-deep px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-paper">
              <FileImage className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-sm text-ink">
                {SOURCE.name}
                <span className="text-ink-soft">.{SOURCE.ext.toLowerCase()}</span>
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                {SOURCE.size} · entrée
              </p>
            </div>
          </div>

          {/* targets */}
          <div>
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
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
                      "rounded-full px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                      active
                        ? "bg-volt text-ink ring-1 ring-inset ring-ink/15"
                        : "border border-ink/15 text-ink-soft hover:border-ink hover:text-ink",
                    ].join(" ")}
                  >
                    .{t.ext.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* output / progress */}
          <div className="rounded-xl border border-line bg-paper-deep p-4">
            {done ? (
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-volt text-ink">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-ink">
                    {SOURCE.name}
                    <span className="text-volt-deep">.{target.ext.toLowerCase()}</span>
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                    {target.size} · prêt
                  </p>
                </div>
                {target.delta !== "—" && (
                  <span className="rounded-md bg-ink px-2 py-1 font-mono text-[11px] font-medium text-volt">
                    {target.delta}
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 py-0.5">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                  <span>Conversion…</span>
                  <span className="text-ink">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-volt transition-[width] duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/image"
            className="group flex items-center justify-between rounded-xl border border-ink/15 px-4 py-3 font-mono text-xs uppercase tracking-wider text-ink transition hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Ouvrir l&apos;outil image
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Format strip ------------------------------ */

const EXTS = [
  "heic", "png", "webp", "avif", "jpg", "raw", "psd", "pdf", "docx", "txt",
  "mp4", "mov", "webm", "gif", "mp3", "wav", "flac", "zip", "7z", "rar",
];

function FormatStrip() {
  const reduce = useReducedMotion();
  const row = [...EXTS, ...EXTS];
  return (
    <section className="overflow-hidden border-b border-ink/40 bg-ink py-4">
      <motion.div
        className="flex w-max gap-8 whitespace-nowrap"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 38, ease: "linear", repeat: Infinity }}
      >
        {row.map((ext, i) => (
          <span
            key={i}
            className="flex items-center gap-8 font-mono text-sm uppercase tracking-wider text-paper/55"
          >
            .{ext}
            <span className="text-volt">+</span>
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* ------------------------------ Tools index ------------------------------- */

type Tool = {
  n: string;
  name: string;
  desc: string;
  formats: string[];
  href: string;
};

const TOOLS: Tool[] = [
  { n: "01", name: "Image", desc: "Convertir, upscaler, nettoyer les métadonnées EXIF", formats: ["png", "webp", "avif", "heic", "raw"], href: "/dashboard/image" },
  { n: "02", name: "PDF", desc: "Fusionner, diviser, compresser, sécuriser", formats: ["pdf", "png", "jpg", "txt"], href: "/dashboard/pdf" },
  { n: "03", name: "PDF Weaver", desc: "Éditeur visuel en glisser-déposer page par page", formats: ["pdf"], href: "/dashboard/pdf-weaver" },
  { n: "04", name: "Vidéo", desc: "Convertir, compresser, extraire, créer des GIF", formats: ["mp4", "mov", "webm", "gif"], href: "/dashboard/video" },
  { n: "05", name: "Audio", desc: "Extraire la piste, couper, générer un spectrogramme", formats: ["mp3", "wav", "flac"], href: "/dashboard/audio" },
  { n: "06", name: "Web Capture", desc: "Page web en PDF/PNG, téléchargeur vidéo & audio", formats: ["pdf", "png", "mp4"], href: "/dashboard/web" },
  { n: "07", name: "Archives", desc: "ZIP chiffré AES-256, mot de passe natif Windows", formats: ["zip", "7z", "rar"], href: "/dashboard/archive" },
  { n: "08", name: "Transfert", desc: "Lien de partage éphémère, jusqu'à 2 Go", formats: ["lien", "qr"], href: "/dashboard/transfer" },
  { n: "09", name: "Demandes", desc: "Liens de dépôt publics pour recevoir des fichiers", formats: ["dépôt"], href: "/dashboard/drop" },
  { n: "10", name: "Cloud", desc: "Historique, stockage perso et coffre MetaVault", formats: ["sync", "store"], href: "/dashboard/cloud" },
];

function ToolsIndex() {
  return (
    <section id="outils" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              <span className="text-volt-deep">//</span> l&apos;index des outils
            </p>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Dix outils chirurgicaux, pas une boîte à outils en désordre.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-ink-soft">
            Chaque outil ne fait qu&apos;une chose, parfaitement. Survolez pour
            voir les formats pris en charge.
          </p>
        </div>

        <ul className="mt-12 border-t border-line">
          {TOOLS.map((t) => (
            <li key={t.n}>
              <Link
                href={t.href}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 border-b border-line py-6 transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:bg-paper-deep sm:grid-cols-[3rem_minmax(0,16rem)_1fr_auto] sm:items-center sm:px-2"
              >
                <span className="font-mono text-sm text-ink-soft transition-colors group-hover:text-volt-deep">
                  {t.n}
                </span>
                <span className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">
                  {t.name}
                </span>
                <span className="col-span-2 text-sm text-ink-soft sm:col-span-1">
                  {t.desc}
                </span>
                <span className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:justify-end">
                  <span className="flex flex-wrap gap-1.5">
                    {t.formats.map((f) => (
                      <span
                        key={f}
                        className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] lowercase tracking-wide text-ink-soft transition-colors group-hover:border-ink/25 group-hover:text-ink"
                      >
                        .{f}
                      </span>
                    ))}
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-soft opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink group-hover:opacity-100" />
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
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            <span className="text-volt-deep">//</span> metatransfer
          </p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[0.95] tracking-tight text-ink sm:text-5xl">
            Envoyez 2 Go.
            <br />
            Le lien expire tout seul.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Un lien propre, un mot de passe optionnel, un QR code, et une date
            d&apos;expiration. Vos destinataires reçoivent les fichiers sans
            créer de compte.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-8">
            <TransferFeat icon={ShieldCheck} term="Chiffré" desc="AES-256 au repos" />
            <TransferFeat icon={Timer} term="Éphémère" desc="Jusqu'à 30 jours" />
            <TransferFeat icon={QrCode} term="QR code" desc="Partage en un scan" />
            <TransferFeat icon={Lock} term="Verrouillé" desc="Mot de passe au choix" />
          </dl>

          <Link
            href="/dashboard/transfer"
            className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 font-mono text-[13px] uppercase tracking-wider text-paper transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Ouvrir le transfert
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* transfer panel mock — a dark object on the deep-paper ground */}
        <div className="relative">
          <div className="rounded-2xl border border-ink/80 bg-ink p-7 shadow-[0_40px_70px_-35px_rgba(22,21,15,0.6)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
                protocole mc-transfer
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-volt">
                ● actif
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3.5 rounded-xl border border-paper/10 bg-paper/[0.04] px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-volt text-ink font-mono text-[11px] font-bold">
                ZIP
              </span>
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-paper">
                  Projet_Archi_Final<span className="text-paper/50">.zip</span>
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-paper/45">
                  1,4 Go · 3 fichiers
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-paper/45">
                <span>Envoi</span>
                <span className="text-volt">89%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper/10">
                <motion.div
                  className="h-full rounded-full bg-volt"
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: "89%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-dashed border-paper/15 px-4 py-3">
              <span className="truncate font-mono text-xs text-paper/55">
                metaconvert.app/t/x7k29q
              </span>
              <span className="ml-3 shrink-0 rounded-md bg-paper/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-paper/70">
                copier
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransferFeat({
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
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-volt-deep" strokeWidth={2} />
      <div>
        <dt className="font-mono text-xs uppercase tracking-wider text-ink">{term}</dt>
        <dd className="mt-0.5 text-sm text-ink-soft">{desc}</dd>
      </div>
    </div>
  );
}

/* ----------------------------- Privacy (dark) ----------------------------- */

const LIFECYCLE = [
  { label: "Upload", desc: "Le fichier arrive chiffré en transit." },
  { label: "Traitement", desc: "Converti en mémoire, jamais indexé." },
  { label: "Suppression", desc: "Effacé du serveur, rien n'est conservé." },
];

function PrivacySection() {
  return (
    <section id="confidentialite" className="border-b border-ink/40 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-14 px-6 py-20 lg:grid-cols-[1fr_0.85fr] lg:py-28">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
            <span className="text-volt">//</span> confidentialité
          </p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
            Traités.
            <br />
            Puis <span className="text-volt">supprimés.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-paper/65">
            MetaConvert est conçu sans rétention. Vos fichiers servent à une seule
            chose — l&apos;opération que vous demandez — puis disparaissent. Pas de
            log de contenu, pas de revente de données.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              "Traitement éphémère côté serveur, suppression immédiate",
              "Chiffrement en transit et AES-256 pour les archives",
              "Aucun log de contenu, aucune revente de données",
              "Conçu selon les standards RGPD européens",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-paper/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-volt text-ink">
                  <Check className="h-3 w-3" strokeWidth={4} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* lifecycle: the file's whole life, in three nodes */}
        <div className="lg:pt-4">
          <div className="rounded-2xl border border-paper/12 bg-paper/[0.03] p-7">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
              <Trash2 className="h-3.5 w-3.5 text-volt" />
              cycle de vie du fichier
            </div>
            <ol className="mt-6 space-y-0">
              {LIFECYCLE.map((s, i) => (
                <li key={s.label} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < LIFECYCLE.length - 1 && (
                    <span className="absolute left-[11px] top-7 h-full w-px bg-paper/15" />
                  )}
                  <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-volt/40 bg-ink font-mono text-[10px] text-volt">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-mono text-sm uppercase tracking-wider text-paper">
                      {s.label}
                    </p>
                    <p className="mt-1 text-sm text-paper/55">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA -------------------------------- */

function FinalCta({ startHref }: { startHref: string }) {
  return (
    <section className="bg-volt">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-28">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-[0.95] tracking-tight text-ink sm:text-6xl">
            Votre prochain fichier
            <br />
            n&apos;attend que vous.
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={startHref}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-mono text-[13px] uppercase tracking-wider text-paper transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-volt"
            >
              Commencer — gratuit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#outils"
              className="font-mono text-[13px] uppercase tracking-wider text-ink/70 underline decoration-ink/30 underline-offset-[6px] transition hover:text-ink hover:decoration-ink"
            >
              ou parcourir les outils →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
