import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

type FeatureItem = {
  title: string;
  description: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy Integration',
    description: 'Works with React, Vue, Angular, Next.js, or vanilla JavaScript',
  },
  {
    title: 'Multiple Widget Types',
    description: 'NPS, CSAT, CES, Reviews, Bug Reports, and Feature Requests',
  },
  {
    title: 'Global CDN',
    description: 'Lightning-fast delivery via Cloudflare',
  },
  {
    title: 'Fully Customizable',
    description: 'Match your brand with extensive styling options',
  },
  {
    title: 'Developer Friendly',
    description: 'TypeScript support and comprehensive documentation',
  },
  {
    title: 'Privacy First',
    description: 'GDPR compliant with no tracking cookies',
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h3>{title}</h3>
        <p style={{ color: 'var(--ifm-font-color-secondary)' }}>{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      description="Build powerful feedback widgets for your applications">
      <main>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {siteConfig.title}
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--ifm-font-color-secondary)', marginBottom: '2rem' }}>
              {siteConfig.tagline}
            </p>
            <Link
              className="button button--primary button--lg"
              to="/docs/getting-started/quick-start">
              Get Started
            </Link>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}