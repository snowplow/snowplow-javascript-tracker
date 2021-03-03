import license from 'rollup-plugin-license';

const bannerContent = `<%= pkg.description %> v<%= pkg.version %> (<%= pkg.homepage %>)
Copyright 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
Licensed under <%= pkg.license %>`;

export const banner = () =>
  license({
    sourcemap: true,
    banner: {
      content: bannerContent,
      commentStyle: 'ignored',
    },
  });
