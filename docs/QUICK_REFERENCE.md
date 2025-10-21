# Quick Reference: Documentation Commands

## Running Locally

```bash
# From the docs directory
npm start        # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run serve    # Preview production build
```

## From Root Directory

```bash
# Quick access
cd docs && npm start
```

## Key Files

- `docusaurus.config.ts` - Main configuration
- `sidebars.ts` - Sidebar structure
- `docs/` - All markdown documentation
- `src/css/custom.css` - Custom styling

## Adding New Pages

1. Create `.md` file in `docs/` subdirectory
2. Add frontmatter:
   ```md
   ---
   sidebar_position: 1
   ---
   ```
3. Page automatically appears in sidebar

## Troubleshooting

**Port already in use?**
- Docusaurus will automatically use next available port
- Or manually: `npm start -- --port 3001`

**Build errors?**
- Check MDX syntax (use `  ` for line breaks, not `<br>`)
- Ensure all sidebar references in `sidebars.ts` have corresponding files

**Styling not updating?**
- Clear cache: `npm run clear`
- Rebuild: `npm run build`
