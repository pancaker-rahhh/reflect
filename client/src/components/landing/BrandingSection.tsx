import { motion } from 'framer-motion'

export const BrandingSection = () => {
  return (
  <section id="cta" className="relative bg-background overflow-hidden py-12">
      {/* Repeated outlined REFLECT rows as main content (not background) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col items-center gap-4">
                  {(() => {
                    // Only 3 rows, with visually distinct offsets
                    // The second row starts at the F of REFLECT (approx 1 char after R)
                    // Assume each char is about 100px wide for this font size
                    const rowOffsets = [-120, 100, 260];
                    return Array.from({ length: 3 }).map((_, row) => {
                      const startOffset = rowOffsets[row] || 0;
                      return (
                        <div key={row} className="relative w-full overflow-visible">
                          {/* main repeated row */}
                          <div className="flex items-center justify-center gap-8 whitespace-nowrap">
                            {Array.from({ length: 6 }).map((__, col) => (
                              <span
                                key={col}
                                className="inline-block outlined-primary font-extrabold tracking-tight font-bungee-outline text-[clamp(40px,6vw,90px)] leading-none"
                                style={{
                                  WebkitTextStroke: `${Math.max(3, 4 - row * 0.2)}px hsl(var(--primary))`,
                                  color: 'transparent',
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  opacity: 0.32 - row * 0.04,
                                  transform: `translateX(${startOffset + col * 6 + row * 6}px)`,
                                }}
                              >
                                REFLECT
                              </span>
                            ))}
                          </div>

                          {/* smeared ghost layer (faint, skewed) */}
                          <div
                            className="absolute inset-0 flex items-center justify-center gap-8 whitespace-nowrap pointer-events-none"
                            style={{ transform: `translateX(${startOffset + 16 + row * 12}px) skewX(-10deg)`, opacity: 0.16 - row * 0.02 }}
                          >
                            {Array.from({ length: 6 }).map((__, col) => (
                              <span
                                key={`g-${col}`}
                                className="inline-block outlined-primary font-extrabold tracking-tight font-bungee-outline text-[clamp(40px,6vw,90px)] leading-none"
                                style={{
                                  WebkitTextStroke: `${Math.max(1.5, 2 - row * 0.15)}px hsl(var(--primary))`,
                                  color: 'transparent',
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  opacity: 0.12 - row * 0.01,
                                  transform: `translateX(${startOffset + col * 6}px)`,
                                }}
                              >
                                REFLECT
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
