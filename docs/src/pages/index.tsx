import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy Integration',
    emoji: '��',
    description: (
      <>
        Add feedback widgets to your website in minutes. Works with React, Vue, 
        Angular, Next.js, or vanilla JavaScript.
      </>
    ),
  },
  {
    title: 'Multiple Widget Types',
    emoji: '📊',
    description: (
      <>
        Support for NPS, CSAT, CES, Reviews, Bug Reports, and Feature Requests. 
        Choose the perfect widget for your needs.
      </>
    ),
  },
  {
    title: 'Global CDN',
    emoji: '⚡',
    description: (
      <>
        Lightning-fast delivery via Cloudflare R2 + CDN. Your widgets load 
        instantly anywhere in the world.
      </>
    ),
  },
  {
    title: 'Fully Customizable',
    emoji: '🎨',
    description: (
      <>
        Match your brand perfectly with extensive styling options. Position, 
        colors, triggers, and more.
      </>
    ),
  },
  {
    title: 'Developer Friendly',
    emoji: '💻',
    description: (
      <>
        Clean API, TypeScript support, comprehensive docs, and examples for 
        every major framework.
      </>
    ),
  },
  {
    title: 'Privacy First',
    emoji: '🔒',
    description: (
      <>
        GDPR compliant, no tracking cookies, rate limiting, and secure by default. 
        Your users privacy matters.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md padding-vert--lg" style={{
        background: 'var(--ifm-card-background-color)',
        borderRadius: '0.75rem',
        border: '1px solid var(--ifm-color-emphasis-300)',
        height: '100%',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{emoji}</div>
        <h3 style={{ color: 'var(--ifm-color-primary)', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--ifm-font-color-secondary)', fontSize: '0.95rem' }}>{description}</p>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={{
      background: 'linear-gradient(135deg, rgba(240, 68, 68, 0.05), rgba(240, 68, 68, 0.02))',
      borderBottom: '1px solid var(--ifm-color-emphasis-300)',
    }}>
      <div className="container">
        <img 
          src="https://cdn.reflectfeedback.com/assets/logo-bg-removed.svg" 
          alt="Reflect Logo" 
          style={{ height: '120px', marginBottom: '2rem' }}
        />
        <h1 className="hero__title" style={{
          background: 'linear-gradient(135deg, hsl(0, 85%, 55%), hsl(0, 85%, 45%))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '3.5rem',
          fontWeight: 800,
          marginBottom: '1.5rem',
        }}>
          {siteConfig.title}
        </h1>
        <p className="hero__subtitle" style={{
          fontSize: '1.5rem',
          color: 'var(--ifm-font-color-base)',
          marginBottom: '2rem',
        }}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/quick-start"
            style={{
              background: 'linear-gradient(135deg, var(--ifm-color-primary), var(--ifm-color-primary-dark))',
              border: 'none',
              boxShadow: '0 4px 14px 0 rgba(240, 68, 68, 0.3)',
            }}>
            🚀 Get Started - 5 min ⏱️
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/widgets/integration/react"
            style={{
              background: 'var(--ifm-card-background-color)',
              color: 'var(--ifm-color-primary)',
              border: '2px solid var(--ifm-color-primary)',
            }}>
            📚 View Integrations
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickExample() {
  return (
    <section style={{ padding: '4rem 0', background: 'var(--ifm-background-surface-color)' }}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2 className="text--center" style={{
              fontSize: '2.5rem',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, hsl(0, 85%, 55%), hsl(0, 85%, 45%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Add a Widget in 30 Seconds
            </h2>
            <p className="text--center" style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--ifm-font-color-secondary)' }}>
              Just two lines of code. That&apos;s it.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col col--8 col--offset-2">
            <pre style={{
              background: 'var(--ifm-card-background-color)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              overflow: 'auto',
            }}>
              <code style={{ color: 'var(--ifm-font-color-base)' }}>{`<!-- Configure the widget -->
<script>
  window.reflectConfig = {
    key: "widget_abc123",
    position: "bottom_right"
  };
</script>

<!-- Load the widget -->
<script async src="https://cdn.reflect.app/widgets/widget_abc123/widget.js"></script>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features} style={{ padding: '4rem 0' }}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2 className="text--center" style={{
              fontSize: '2.5rem',
              marginBottom: '3rem',
            }}>
              Why Developers Choose Reflect
            </h2>
          </div>
        </div>
        <div className="row" style={{ gap: '1.5rem 0' }}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Documentation`}
      description="Build powerful feedback widgets for your applications">
      <HomepageHeader />
      <main>
        <QuickExample />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
