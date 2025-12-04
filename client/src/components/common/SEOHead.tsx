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
  schemaType?: 'homepage' | 'product' | 'pricing' | 'blog' | 'default'
  breadcrumbs?: Array<{ name: string; url: string }>
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
  schemaType = 'default',
  breadcrumbs,
}: SEOHeadProps) => {
  // Use title as-is if it already contains "Reflect" (for homepage), otherwise append suffix
  // Enforce title length ≤ 60 chars for SEO best practices
  let fullTitle = title.includes('Reflect') ? title : `${title} | Reflect`
  if (fullTitle.length > 60) {
    fullTitle = fullTitle.substring(0, 57) + '...'
  }
  // Enforce description length ≤ 155 chars for SEO best practices
  const fullDescription =
    description.length > 155 ? description.substring(0, 152) + '...' : description
  const siteUrl = 'https://reflectfeedback.com'
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`

  // Generate schema based on page type
  const generateSchema = () => {
    if (structuredData) return structuredData

    const baseSchemas: any[] = []

    // Homepage schemas
    if (schemaType === 'homepage') {
      baseSchemas.push(
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Reflect',
          url: siteUrl,
          description: 'In-app feedback tool and bug reporting widget for SaaS teams',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Reflect Technologies, Inc.',
          url: siteUrl,
          logo: `${siteUrl}/og-image.png`,
          description: 'Leading in-app feedback and customer insights platform',
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
        }
      )
    }

    // Product page schemas (Features, Widget, Bug Reporting, Feature Requests)
    if (schemaType === 'product') {
      baseSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: description,
        url: canonicalUrl || siteUrl,
        brand: {
          '@type': 'Brand',
          name: 'Reflect',
        },
        image: fullOgImage,
        manufacturer: {
          '@type': 'Organization',
          name: 'Reflect Technologies, Inc.',
        },
        offers: {
          '@type': 'Offer',
          url: `${siteUrl}/pricing`,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      })
    }

    // Pricing page FAQ schema
    if (schemaType === 'pricing') {
      // FAQ schema will be passed via structuredData prop from PricingPage
      baseSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description: description,
        url: canonicalUrl || siteUrl,
      })
    }

    // Blog schema
    if (schemaType === 'blog') {
      baseSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Reflect Blog',
        description: 'Product feedback and SaaS growth insights',
        url: `${siteUrl}/blog`,
        publisher: {
          '@type': 'Organization',
          name: 'Reflect Technologies, Inc.',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/og-image.png`,
          },
        },
      })
    }

    // Default schemas (fallback)
    if (schemaType === 'default' && baseSchemas.length === 0) {
      baseSchemas.push(
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description: description,
          url: canonicalUrl || siteUrl,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Reflect Technologies, Inc.',
          url: siteUrl,
          logo: `${siteUrl}/og-image.png`,
        }
      )
    }

    return baseSchemas.length > 0 ? baseSchemas : []
  }

  // Generate breadcrumb schema if provided
  const generateBreadcrumbSchema = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb: { name: string; url: string }, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    }
  }

  // Enhanced structured data for SaaS platform with multiple schemas
  const defaultStructuredData = generateSchema()
  const breadcrumbSchema = generateBreadcrumbSchema()

  // Combine all schemas
  const allStructuredData = [
    ...(Array.isArray(defaultStructuredData) ? defaultStructuredData : [defaultStructuredData]),
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ...(structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : []),
  ].filter(Boolean)

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Reflect Technologies, Inc." />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
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

      {/* DNS Prefetch for CDN (preconnect removed to avoid duplicate - handled in index.html) */}
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
      {articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}

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

      {import.meta.env.MODE === 'production' && (
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      )}

      {/* Bing/Yahoo */}
      <meta name="yandex-verification" content="" />
      <meta name="msvalidate.01" content="" />

      {/* Google */}
      <meta name="google-site-verification" content="" />
      <meta name="google" content="notranslate" />

      {/* Structured Data */}
      {allStructuredData.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(
            allStructuredData.length === 1 ? allStructuredData[0] : allStructuredData
          )}
        </script>
      )}
    </Helmet>
  )
}
