
      // Configuration du proxy pour la Chine
      user_pref("network.proxy.type", 1); // Mode manuel
      user_pref("network.proxy.http", "59.82.43.238");
      user_pref("network.proxy.http_port", 80);
      user_pref("network.proxy.ssl", "59.82.43.238");
      user_pref("network.proxy.ssl_port", 80);
      user_pref("network.proxy.ftp", "59.82.43.238");
      user_pref("network.proxy.ftp_port", 80);
      user_pref("network.proxy.socks", "59.82.43.238");
      user_pref("network.proxy.socks_port", 80);
      user_pref("network.proxy.no_proxies_on", "localhost, 127.0.0.1");
      user_pref("network.proxy.share_proxy_settings", true);
      
      // Désactiver WebRTC pour éviter les fuites d'IP
      user_pref("media.peerconnection.enabled", false);
      
      // Configurer la géolocalisation pour la Chine
      user_pref("geo.provider.network.url", "https://location.services.mozilla.com/v1/geolocate?key=test");
      user_pref("geo.wifi.uri", "data:application/json,{"location": {"lat": 31.2304, "lng": 121.4737}, "accuracy": 10.0}");
      
      // Configurer la langue et la région pour la Chine
      user_pref("intl.accept_languages", "zh-CN,zh;q=0.9,en;q=0.8");
      user_pref("intl.regional_prefs.use_os_locales", false);
      user_pref("general.useragent.locale", "zh-CN");
    