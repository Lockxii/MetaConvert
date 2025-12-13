export default function CookiesPage() {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Politique relative aux Cookies</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
          
          <h2>1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web.
            Ils permettent au site de mémoriser vos actions et préférences sur une période donnée.
          </p>

          <h2>2. Comment utilisons-nous les cookies ?</h2>
          <p>
            Nous utilisons les cookies pour :
          </p>
          <ul>
            <li><strong>Authentification :</strong> Vous garder connecté à votre compte.</li>
            <li><strong>Sécurité :</strong> Protéger votre compte et nos services contre la fraude.</li>
            <li><strong>Préférences :</strong> Mémoriser votre langue et vos paramètres d'affichage.</li>
            <li><strong>Analyse :</strong> Comprendre comment vous utilisez notre site pour l'améliorer (via Google Analytics, etc.).</li>
          </ul>

          <h2>3. Types de cookies utilisés</h2>
          <ul>
            <li><strong>Cookies Essentiels :</strong> Indispensables au fonctionnement du site. Vous ne pouvez pas les refuser sans affecter le fonctionnement du service.</li>
            <li><strong>Cookies de Performance :</strong> Recueillent des informations anonymes sur l'utilisation du site.</li>
            <li><strong>Cookies Fonctionnels :</strong> Permettent d'améliorer votre expérience (ex: mémoriser votre email de connexion).</li>
          </ul>

          <h2>4. Gestion des cookies</h2>
          <p>
            Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Pour plus de détails, consultez <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a>.
            Vous pouvez supprimer tous les cookies déjà présents sur votre ordinateur et paramétrer la plupart des navigateurs pour qu'ils les bloquent.
          </p>

          <h2>5. Modifications</h2>
          <p>
            Nous pouvons mettre à jour cette politique de temps à autre. Nous vous encourageons à consulter cette page régulièrement.
          </p>
        </div>
      </div>
    </div>
  );
}
