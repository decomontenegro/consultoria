# CulturaBuilder Enterprise AI Readiness Assessment

## Overview

Professional-grade AI transformation and voice coding readiness assessment tool for C-suite decision makers.

**Key Principles:**
- ✅ Data-driven: All metrics backed by verified industry research
- ✅ Conservative: ROI projections use realistic, defendable assumptions
- ✅ Transparent: Full methodology documentation and source citations
- ✅ Professional: Designed for board-level presentations

## Data Sources

All benchmarks and calculations reference:
- McKinsey GenAI Developer Productivity Report 2024
- Forrester Total Economic Impact Studies 2024
- DORA State of DevOps Report 2024
- GitHub Octoverse 2024
- Stack Overflow Developer Survey 2024
- Gartner AI/ML Development Survey 2024

## Technology Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Project Structure

```
├── app/                    # Next.js app router
│   ├── assessment/         # Multi-step assessment form
│   ├── report/            # Dynamic report generation
│   └── api/               # Backend endpoints
├── components/            # React components
│   ├── assessment/        # Assessment form components
│   ├── report/           # Report visualization components
│   └── ui/               # Reusable UI components
├── lib/                   # Core business logic
│   ├── calculators/       # ROI calculation engines
│   ├── benchmarks/        # Industry benchmark data loaders
│   └── report-generator/  # PDF/report generation
└── data/                  # Verified industry data
    ├── benchmarks.json    # Performance & cost benchmarks
    └── industries.json    # Industry-specific data
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Deploy (zero config needed)

## Methodology

Full methodology documentation available in `/docs/methodology.md`

All ROI calculations are:
- Conservative (lower bound of research-backed ranges)
- Industry-specific (benchmarked against sector peers)
- Auditable (sources cited for every metric)

## Integration with CulturaBuilder.com

This assessment tool is designed to integrate seamlessly with the main CulturaBuilder website as a subdomain or path:
- `assessment.culturabuilder.com`
- `culturabuilder.com/assessment`

## License

Proprietary - CulturaBuilder © 2025
