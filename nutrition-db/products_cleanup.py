import pandas as pd
import polars as pl

df_pd = pd.read_csv(
    "products.csv",
    sep="\t",               # tab-delimited
    engine="python",        # more forgiving parser
    on_bad_lines="skip",    # skip malformed rows
    quoting=3               # csv.QUOTE_NONE equivalent for messy quotes
)


df = pl.from_pandas(df_pd)

# 1️⃣ Remove rows where product_name is empty or null
df = df.filter(pl.col("product_name").is_not_null() & (pl.col("product_name") != ""))

# 2️⃣ Keep only barcode and product_name columns
df = df.select(["code", "product_name"])

# 3️⃣ Create a new normalized column (lowercase & stripped)
df = df.with_columns([
    pl.col("product_name").str.strip_chars().str.to_lowercase().alias("product_name_norm")
])

# 4️⃣ Save to a new CSV
df.write_csv("products_cleaned.csv")

print("CSV cleanup complete! Saved as 'products_cleaned.csv'")
