import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  structuredData?: any
  noIndex?: boolean
  articlePublishedTime?: string
  articleModifiedTime?: string
  ogType?: string
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = '/og-image.jpg',
  structuredData,
  noIndex = false,
  articlePublishedTime,
  articleModifiedTime,
  ogType = 'website',
}: SEOHeadProps) => {
  const fullTitle = `${title} | Reflect - User Feedback Platform`
  const fullDescription = description.length > 160 ? description.substring(0, 157) + '...' : description
  const siteUrl = 'https://reflectfeedback.com'
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`

  // Enhanced structured data for SaaS platform with multiple schemas
  const defaultStructuredData = [
    // SoftwareApplication Schema
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Reflect',
      description: 'User feedback platform for collecting bug reports, feature requests, and customer insights',
      url: siteUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free plan with essential features',
        },
        {
          '@type': 'Offer',
          name: 'Startup Plan',
          price: '29',
          priceCurrency: 'USD',
          description: 'Perfect for growing teams',
        },
        {
          '@type': 'Offer',
          name: 'Business Plan',
          price: '49',
          priceCurrency: 'USD',
          description: 'For established companies',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Bug Report Collection',
        'Feature Request Management',
        'User Surveys (NPS, CSAT, CES)',
        'Public Roadmaps',
        'Analytics Dashboard',
        'Customizable Widget',
        'Team Collaboration',
        'API Integration',
      ],
      screenshot: fullOgImage,
      author: {
        '@type': 'Organization',
        name: 'Reflect Technologies, Inc.',
        url: siteUrl,
      },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: 'en-US',
    },
    // Organization Schema
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Reflect Technologies, Inc.',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: 'Leading user feedback and customer insights platform',
      sameAs: [
        'https://x.com/Reflectfeedback',
        'https://www.instagram.com/reflect_feedback/',
        'https://github.com/reflect',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@reflectfeedback.com',
        availableLanguage: ['English'],
      },
    },
    // WebSite Schema with Search Action
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Reflect',
      url: siteUrl,
      description: 'User feedback platform for collecting bug reports, feature requests, and customer insights',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // FAQ Schema (if applicable)
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Reflect?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Reflect is a comprehensive user feedback platform that helps you collect bug reports, feature requests, and customer insights through customizable widgets and forms.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does it take to set up Reflect?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Reflect can be set up in just 3 minutes. Simply create an account, customize your widget, and add a simple code snippet to your website.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a free plan available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Reflect offers a free plan with essential features including unlimited feedback collection, basic analytics, and widget customization.',
          },
        },
      ],
    },
    // BreadcrumbList Schema
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
      ],
    },
  ]

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Reflect Technologies, Inc." />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#EF4444" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="General" />
      <meta name="distribution" content="global" />
      <meta name="geo.region" content="IN-KA" />
      <meta name="geo.placename" content="Bengaluru, India" />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <link rel="alternate" hrefLang="en" href={canonicalUrl || siteUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl || siteUrl} />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://cdn.reflectfeedback.com" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:site_name" content="Reflect" />
      <meta property="og:locale" content="en_US" />
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@Reflectfeedback" />
      <meta name="twitter:creator" content="@Reflectfeedback" />
      <meta name="twitter:domain" content="reflectfeedback.com" />

      {/* Additional SEO */}
      <meta name="msapplication-TileColor" content="#EF4444" />
      <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Reflect" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Security Headers */}
      <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      
      {/* Bing/Yahoo */}
      <meta name="yandex-verification" content="" />
      <meta name="msvalidate.01" content="" />
      
      {/* Google */}
      <meta name="google-site-verification" content="" />
      <meta name="google" content="notranslate" />

      {/* Structured Data */}
      {(structuredData || defaultStructuredData) && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData || defaultStructuredData)}
        </script>
      )}
    </Helmet>
  )
}
