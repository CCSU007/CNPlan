"""
Quick statistical summary of a CSV file.
Usage: python quick-stats.py <path-to-csv>
"""
import sys
import pandas as pd

path = sys.argv[1]
df = pd.read_csv(path)

print(f"Shape: {df.shape}")
print(f"\n--- Info ---")
df.info()
print(f"\n--- Head ---")
print(df.head())
print(f"\n--- Describe ---")
print(df.describe(include="all"))
print(f"\n--- Missing ---")
print(df.isnull().sum())
print(f"\n--- Duplicates ---")
print(df.duplicated().sum())
