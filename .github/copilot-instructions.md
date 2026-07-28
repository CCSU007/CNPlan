# Data Analysis Project Guidelines

## Tech Stack
- **Python 3.12+** with `pandas`, `numpy`, `matplotlib`, `seaborn`, `scikit-learn`
- Notebooks (`.ipynb`) for exploration; `.py` scripts for reusable logic
- **Plotly** for interactive visualizations

## Data Conventions
- Raw data goes in `data/raw/`, processed data in `data/processed/`
- Use `snake_case` for column names and variables
- Always include a `data/` `.gitkeep` to preserve folder structure
- Document column data types and nullability in a `data/dictionary.md`

## Analysis Workflow
1. **Explore** — understand shape, types, missing values, distributions
2. **Clean** — handle nulls, outliers, type coercion
3. **Transform** — feature engineering, aggregations, merges
4. **Analyze** — statistical tests, modeling
5. **Visualize** — charts with clear labels, titles, and legends
6. **Report** — summarize findings with actionable insights

## Output Standards
- Charts saved as PNG (300 DPI) in `reports/figures/`
- Final reports as `.md` or `.html` in `reports/`
- Include a `seed=42` for any randomized process (train/test split, sampling)

## Code Style
- Use type hints on all function signatures
- Pandas chain operations with `.pipe()` for readability
- Log key steps with `print(f"[{datetime.now():%H:%M:%S}] {msg}")`
