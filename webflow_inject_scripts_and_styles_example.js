function injectInjectionScript() {
    const webflowURLs = {
        production: 'https://domain-name-navbar-nw.webflow.io/', // production URL for your Webflow site
        staging: 'https://domain-name-navbar-nw.webflow.io/' // staging URL for your Webflow site
        //production: 'http://localhost/mycdn/', // production URL for your Webflow site
        //staging: 'http://localhost/mycdn/' // staging URL for your Webflow site
    };
    const CDNURLs = {
        // TODO these are currently the same, but can be different once correct domain is assigned ot them
        production: 'https://testrepo-leo.pages.dev/', // production URL for your custom code on CloudFlare CDN
        staging: 'https://testrepo-leo.pages.dev/' // staging URL for your custom code on CloudFlare CDN
        //production: '/', // for local testing
        //staging: '/'  // for local testing
    };

    let globalAssetVersion = '1'; // TODO change this to ensure that all scripts' and stylesheets' cache is properly overridden
    // optionally -> if you want to ensure just a specific script's cache is 100% cleared, you can just modify/increment the v=X in scriptPaths
    // i.e. this might be useful if you have massive scripts, that you wouldn't to always clear all, if just a few were changed

    // Define script and stylesheet paths for production and staging
    let assets = {
        // add the scripts that you want to inject to production site and this would inject the scripts in the master branch
        production: [
            {
                type: 'script',
                path: 'test.js?v=1',
            },
            {
                type: 'stylesheet',
                path: 'styles/style1.css?v=1',
            },
        ],
        // add the scripts that you want to inject to the staging site and this would inject the scripts in the staging branch
        staging: [
            {
                type: 'script',
                path: 'test.js?v=1',
            },
            {
                type: 'stylesheet',
                path: 'styles/style1.css?v=1',
            },
        ],
    };

    // Append globalAssetVersion to all script and stylesheet paths
    for (let [envType, assetsList] of Object.entries(assets)) {
        for (let asset of assetsList) {
            asset.path += '_' + globalAssetVersion;
        }
    }

    const productionHost = new URL(webflowURLs.production).hostname;
    const stagingHost = new URL(webflowURLs.staging).hostname;
    const url = window.location.hostname;
    const useStagingByDefault = true; // if set to true, staging scripts will always be loaded (I.e. useful for testing, and not having to adjust the cdn & webflow url constantly)
    if (url === productionHost) {
        const assetURLs = assets.production.map(asset => ({
            url: asset.type === 'script' ? `${CDNURLs.production}${asset.path}` : `${CDNURLs.production}${asset.path}`,
            type: asset.type,
        }));
        Promise.all(assetURLs.map(injectAsset)).then(() => console.log('All production assets loaded successfully'));
    } else if (useStagingByDefault || url === stagingHost) {
        const assetURLs = assets.staging.map(asset => ({
            url: asset.type === 'script' ? `${CDNURLs.staging}${asset.path}` : `${CDNURLs.staging}${asset.path}`,
            type: asset.type,
        }));
        Promise.all(assetURLs.map(injectAsset)).then(() => console.log('All staging assets loaded successfully'));
    }
}

function injectAsset(asset) {
    return new Promise((resolve, reject) => {
        if (asset.type === 'script') {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = asset.url;
            script.addEventListener('load', evt => resolve(evt.target));
            script.addEventListener('error', e => reject(e.error));
            document.body.appendChild(script);
        } else if (asset.type === 'stylesheet') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = asset.url;
            link.addEventListener('load', evt => resolve(evt.target));
            link.addEventListener('error', e => reject(e.error));
            document.head.appendChild(link);
        }
    });
}



document.addEventListener('DOMContentLoaded', function () {
    // Your JavaScript code goes here
    console.log('DOM content has been loaded');
    injectInjectionScript();
});

