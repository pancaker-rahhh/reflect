import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  structuredData?: any
  noIndex?: boolean
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = '/og-image.jpg',
  structuredData,
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = `${title} | Reflect - User Feedback Platform`
  const fullDescription = `${description} - The fastest way to collect user feedback. Bug reports, feature requests, and surveys in one platform. 3-minute setup, free plan available.`

  // Enhanced structured data for SaaS platform
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Reflect',
    description:
      'User feedback platform for collecting bug reports, feature requests, and customer insights',
    url: 'https://reflect.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free plan available with premium options',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'Bug Report Collection',
      'Feature Request Management',
      'User Surveys',
      'Public Roadmaps',
      'Analytics Dashboard',
      'Widget Integration',
    ],
    screenshot: 'https://reflect.com/og-image.jpg',
    author: {
      '@type': 'Organization',
      name: 'Reflect Technologies',
    },
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Reflect Technologies, Inc." />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#7c3aed" />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Reflect" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@reflect" />
      <meta name="twitter:creator" content="@reflect" />

      {/* Additional SEO */}
      <meta name="msapplication-TileColor" content="#7c3aed" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Reflect" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  )
}
