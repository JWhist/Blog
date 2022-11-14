const VARIANTS = [
  {
    name: 'main',
    url: 'https://main--jocular-pavlova-6e97f0.netlify.app/',
    script: '',
  },
  {
    name: 'alt',
    url: 'https://deploy-preview-1--jocular-pavlova-6e97f0.netlify.app/',
    script: '',
  },
];
const RULE = {
  filter: {
    device: '',
    browser: ['chrome'],
    header: {},
    cookie: '',
  },
  destinations: [
    {
      variantName: 'main',
      weight: '50',
    },
    {
      variantName: 'alt',
      weight: '50',
    },
  ],
  note: '',
};

export default async (request, context) => {
  const cookieName = 'splitLIFY';
  const host = request.headers.get('host');
  const cookie = request.headers.get('cookie');
  const filter = RULE.filter;
  const destinations = RULE.destinations;
  let vars = VARIANTS;
  // strip leading http:// or https:// from urls if present
  vars = vars.map((variant) => {
    if (variant.url.startsWith('http://')) {
      variant.url = variant.url.slice(7);
      return variant;
    } else if (variant.url.startsWith('https://')) {
      variant.url = variant.url.slice(8);
      return variant;
    } else return variant;
  });

  // If they've been there before get the appropriate content
  if (cookie) {
    const destination = destinations.find(({ variantName }) =>
      cookie.includes(`${cookieName}=${variantName}`)
    );
    if (destination) {
      const variant = vars.find(
        (variant) => variant.name === destination.variantName
      );
      const newResponse = await fetch(variant.url);
      const originalresponse = context.next();
      return request.url === variant.url ? originalresponse : newResponse;
    }
  }

  // Otherwise, if they don't match the criteria, just return
  if (!matchCriteria(request, filter)) {
    return;
  }

  // Otherwise, pick a variant and set the cookie, and send that content
  const destination = randomDestination(destinations);
  const variant = vars.find(
    (variant) => variant.name === destination.variantName
  );
  const newResponse = await fetch(variant.url);
  const originalResponse = context.next();
  if (request.url === variant.url) {
    response = addCookie(originalResponse, cookieName, variant.name);
    return response;
  }
  response = addCookie(newResponse, cookieName, variant.name);
  return response;
};

function addCookie(response, cookieName, variantName) {
  const newResponse = new Response(response.body, response);
  newResponse.headers.append(
    'Set-Cookie',
    `${cookieName}=${variantName}; path=/`
  );
  return newResponse;
}

function randomDestination(destinations) {
  const num = Math.random() * 100;
  let total = 0;
  let destination;
  for (let index = 0; index < destinations.length; index += 1) {
    destination = destinations[index];
    total += destination.weight;
    if (total >= num) {
      break;
    }
  }
  return destination;
}

function matchCriteria(request, filter) {
  const criteriaTypes = {
    device: matchDeviceCriteria,
    header: matchHeaderCriteria,
    browser: matchBrowserCriteria,
    cookie: matchCookieCriteria,
  };

  let isMatch = true;
  for (const [key, value] of Object.entries(filter)) {
    const match = criteriaTypes[key](request, value);
    if (!match) {
      isMatch = match;
      break;
    }
  }

  return isMatch;
}

function matchDeviceCriteria(request, value) {
  if (value === '') return true;

  const regex =
    /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i;

  const device = request.headers.get('User-Agent').match(regex)
    ? 'mobile'
    : 'desktop';

  return value === device;
}

function matchBrowserCriteria(request, values) {
  if (values.length === 0) return true;

  const regex = /(edg|opera|chrome|safari|firefox|msie|trident)/i;
  const userBrowser = request.headers.get('User-Agent').match(regex)[0];
  return values.some(
    (browser) => browser.toLowerCase() === userBrowser.toLowerCase()
  );
}

function matchHeaderCriteria(request, header) {
  return (
    Object.keys(header).length === 0 ||
    request.headers.get(header.name) === header.value
  );
}

function matchCookieCriteria(request, value) {
  if (!value) return true;
  const cookie = request.headers.get('cookie');
  if (!cookie) return false;
  return cookie.includes(value);
}
