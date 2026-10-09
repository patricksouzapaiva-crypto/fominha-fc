/* Config pública do Supabase. A chave é publishable (sb_publishable_...), feita pra ir no navegador. */
(function (root) {
  'use strict';
  const C = {
    SUPABASE_URL: 'https://oyhdmsxvhiqortaocetr.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_Ecg325kYYW-MwWJwxW3gkA_kXA0trsk'
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  else root.FFConfig = C;
})(typeof window !== 'undefined' ? window : this);
