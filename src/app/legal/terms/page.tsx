export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Conditions Générales d'Utilisation (CGU)</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
          
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant le service MetaConvert, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation.
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </p>

          <h2>2. Description du service</h2>
          <p>
            MetaConvert fournit des outils en ligne pour la conversion, la compression et l'édition de fichiers numériques (PDF, Images, Vidéo, Audio).
            Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment.
          </p>

          <h2>3. Utilisation acceptable</h2>
          <p>
            Vous vous engagez à ne pas utiliser le service pour :
          </p>
          <ul>
            <li>Télécharger des fichiers illégaux, malveillants ou protégés par des droits d'auteur dont vous ne possédez pas les droits.</li>
            <li>Tenter de perturber ou de compromettre l'intégrité de nos systèmes.</li>
            <li>Revendre ou exploiter commercialement le service sans autorisation.</li>
          </ul>

          <h2>4. Responsabilité</h2>
          <p>
            MetaConvert est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs.
            Nous ne sommes pas responsables de la perte de données ou des dommages résultant de l'utilisation de fichiers convertis.
            Il est de votre responsabilité de conserver une copie originale de vos fichiers.
          </p>

          <h2>5. Abonnements et Paiements</h2>
          <p>
            Certaines fonctionnalités nécessitent un abonnement payant. Les paiements sont non remboursables, sauf disposition contraire de la loi.
            Vous pouvez annuler votre abonnement à tout moment via votre tableau de bord.
          </p>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            Vous conservez tous les droits sur les fichiers que vous téléchargez.
            MetaConvert détient les droits sur l'interface, le code, et la marque du service.
          </p>

          <h2>7. Loi applicable</h2>
          <p>
            Ces conditions sont régies par les lois en vigueur. Tout litige sera soumis à la compétence exclusive des tribunaux compétents.
          </p>
        </div>
      </div>
    </div>
  );
}
