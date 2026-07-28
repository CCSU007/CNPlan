# EDA Checklist

## Initial Inspection
- [ ] Load data with correct types (`parse_dates`, `dtype`)
- [ ] Check shape: `df.shape`
- [ ] Column info: `df.info()`
- [ ] First/last rows: `df.head()`, `df.tail()`
- [ ] Summary stats: `df.describe(include='all')`

## Missing Values
- [ ] Count nulls per column: `df.isnull().sum()`
- [ ] Visualize: `sns.heatmap(df.isnull())`
- [ ] Decide: drop if >50% missing; impute otherwise

## Outliers
- [ ] Boxplots per numeric column
- [ ] IQR method: `Q1 - 1.5*IQR`, `Q3 + 1.5*IQR`
- [ ] Domain-specific bounds if known

## Distributions
- [ ] Histogram + KDE for each numeric column
- [ ] Value counts for categorical columns
- [ ] Check for skewness / multimodal patterns

## Relationships
- [ ] Correlation matrix + heatmap
- [ ] Pairplot (sample if >50k rows)
- [ ] Cross-tabulations for categorical pairs

## Data Quality
- [ ] Duplicate rows: `df.duplicated().sum()`
- [ ] Unique value counts: `df.nunique()`
- [ ] Value ranges (min/max) make sense
