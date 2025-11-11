import polars as pl
from rapidfuzz import process, fuzz

search_column = "product_name"
code_column = "code"

df = pl.read_csv("products.csv", columns=[search_column, code_column])
print("loaded csv")

values = df[search_column].to_list()
codes = df[code_column].to_list()


query = "pasta"
top5 = process.extract(
    query,
    values,
    scorer=fuzz.WRatio,
    limit=5
)
results = [(match, codes[values.index(match)], score) for match, score, _ in top5]

for val, code, score in results:
    print(f"{val} | {code} | {score}")