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
    browser: [],
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

export default { VARIANTS, RULE };
