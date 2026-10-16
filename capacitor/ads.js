/* ads.js: conecta el juego con Google AdMob dentro de la app de Capacitor.
   Plugin: @capacitor-community/admob  (npm i @capacitor-community/admob && npx cap sync)
   Revisa los nombres de métodos con el README de la versión que instales: los plugins cambian.
   En la web este archivo no hace nada. */
(async function () {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  const AdMob = C.Plugins && C.Plugins.AdMob;
  if (!AdMob) return;

  // IDs DE PRUEBA de Google. Sustitúyelos por los tuyos de AdMob solo para la versión final.
  // Nunca pulses tus propios anuncios reales: Google puede cerrarte la cuenta.
  const IDS = {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712'
  };
  const TESTING = true; // ponlo a false al publicar

  try { await AdMob.initialize({ initializeForTesting: TESTING }); } catch (e) { return; }

  // Formulario de consentimiento (RGPD). Hay que configurarlo antes en AdMob > Privacidad y mensajes.
  try {
    const info = await AdMob.requestConsentInfo();
    if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await AdMob.showConsentForm();
  } catch (e) {}

  let rewardedReady = false;
  async function loadRewarded() {
    try { await AdMob.prepareRewardVideoAd({ adId: IDS.rewarded, isTesting: TESTING }); rewardedReady = true; }
    catch (e) { rewardedReady = false; setTimeout(loadRewarded, 30000); }
  }
  loadRewarded();

  window.FY_ADS = {
    rewardedReady: () => rewardedReady,
    // Devuelve true solo si el jugador ha visto el anuncio y gana la recompensa
    showRewarded: async () => {
      if (!rewardedReady) return false;
      rewardedReady = false;
      try { const reward = await AdMob.showRewardVideoAd(); return !!reward; }
      catch (e) { return false; }
      finally { loadRewarded(); }
    },
    showInterstitial: async () => {
      try { await AdMob.prepareInterstitial({ adId: IDS.interstitial, isTesting: TESTING }); await AdMob.showInterstitial(); }
      catch (e) {}
    }
  };
})();
