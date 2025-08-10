import { Globe, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'

const languages = ['EN', 'ES', 'FR', 'DE', 'IT', 'PT', 'NL', 'RU', 'JA', 'KO', 'ZH']

export function LanguageSupportBanner() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-sm">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Multi-Language Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Collect feedback in your users&apos; preferred language. Our widgets support automatic translations
              for a global audience.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-1.5">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-white dark:bg-gray-900 rounded border shadow-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all languages
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}