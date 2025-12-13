export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Bienvenue sur MetaConvert. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles.
            Cette politique de confidentialité explique comment nous collectons, utilisons et partageons vos informations lorsque vous utilisez notre service.
          </p>

          <h2>2. Données collectées</h2>
          <p>
            Nous collectons les types d'informations suivants :
          </p>
          <ul>
            <li><strong>Informations de compte :</strong> Nom, adresse email, mot de passe (chiffré).</li>
            <li><strong>Fichiers :</strong> Les fichiers que vous téléchargez pour conversion ou traitement.</li>
            <li><strong>Données d'utilisation :</strong> Logs de connexion, type de navigateur, adresses IP.</li>
          </ul>

          <h2>3. Utilisation des fichiers</h2>
          <p>
            Vos fichiers sont utilisés <strong>uniquement</strong> dans le but de fournir le service de conversion ou de traitement demandé.
          </p>
          <ul>
              <li>Nous ne consultons pas le contenu de vos fichiers.</li>
              <li>Les fichiers sont automatiquement supprimés de nos serveurs après 24 heures (ou selon votre plan).</li>
              <li>Nous ne partageons vos fichiers avec aucun tiers, sauf si nécessaire pour le traitement (ex: infrastructure cloud sécurisée).</li>
          </ul>

          <h2>4. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la modification, la divulgation ou la destruction.
            Toutes les communications sont chiffrées via SSL/TLS.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Nous utilisons des cookies essentiels pour le fonctionnement du site (authentification) et des cookies analytiques pour améliorer notre service.
          </p>

          <h2>6. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
            Pour exercer ces droits, contactez-nous à privacy@metaconvert.com.
          </p>

          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant cette politique, veuillez nous contacter à : support@metaconvert.com
          </p>
        </div>
      </div>
    </div>
  );
}
