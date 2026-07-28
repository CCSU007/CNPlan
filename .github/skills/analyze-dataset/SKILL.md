---
name: analyze-dataset
description: 'Explore, clean, and visualize a CSV/Excel dataset. Use when: analyzing data, generating summary stats, creating EDA plots, cleaning data, or building reports.'
argument-hint: 'path to dataset file'
user-invocable: true
---

# Analyze Dataset

## When to Use
- You have a new CSV or Excel file and need to understand its contents
- You need summary statistics, missing-value analysis, or distribution plots
- You want a cleaned dataset ready for modeling
- You need charts saved to `reports/figures/`

## Procedure

### 1. Load & Explore
Read the file into a `pandas` DataFrame and print:
- Shape (`df.shape`)
- Column names, dtypes, non-null counts (`df.info()`)
- First 5 rows (`df.head()`)
- Descriptive stats (`df.describe(include='all')`)
- Missing-value heatmap

### 2. Clean
Apply fixes based on exploration:
- Drop or impute nulls (document the decision)
- Fix data types (dates, categories, numeric coercion)
- Handle outliers (IQR or domain-specific thresholds)
- Rename columns to `snake_case` if needed

### 3. Transform
Create new features or aggregations:
- Derived columns (ratios, bins, date parts)
- Aggregations (grouped means, counts)
- Filter or sample as needed

### 4. Visualize
Generate and save the following plots to `reports/figures/` (300 DPI):
- **Distribution**: histogram + KDE for numeric columns
- **Categorical**: bar chart for value counts
- **Correlation**: heatmap (numeric columns)
- **Pairplot**: if ≤8 numeric columns
- **Boxplot**: per numeric column to spot outliers

Use `seaborn` for static plots and `plotly` for interactive ones.

### 5. Report
Write a summary to `reports/<dataset-name>-summary.md` covering:
- Dataset overview (rows, columns, data types)
- Key findings (missing patterns, outliers, distributions)
- Notable correlations or relationships
- Recommended next steps

## Example
```python
# Usage snippet — the agent will adapt to your actual file
import pandas as pd
df = pd.read_csv("data/raw/sales.csv")
print(df.shape)
print(df.info())
```

## Reference
- [EDA checklist](./references/eda-checklist.md)
