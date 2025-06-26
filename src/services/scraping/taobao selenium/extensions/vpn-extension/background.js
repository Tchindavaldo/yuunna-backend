
          // Configuration du proxy pour la Chine
          function setupProxy() {
            browser.proxy.settings.set({
              value: {
                proxyType: "manual",
                http: "59.82.43.238:80",
                https: "59.82.43.238:443",
                socks: "59.82.43.238:1080",
                socksVersion: 5,
                passthrough: "<local>"
              },
              scope: "regular"
            });
            console.log("Proxy configuré pour la Chine");
          }
          
          // Activer le proxy au démarrage
          setupProxy();
        