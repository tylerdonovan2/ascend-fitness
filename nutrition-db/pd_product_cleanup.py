import pandas as pd

print("📥 Loading CSV...")
df = pd.read_csv(
    "products.csv",
    sep="\t",                 # tab-delimited
    engine="python",          # more forgiving parser
    on_bad_lines="skip",      # skip malformed rows
    quoting=3                  # csv.QUOTE_NONE equivalent
)
print(f"✅ CSV loaded. Shape: {df.shape}")

print("🧹 Removing rows with empty or null 'product_name'...")
before = df.shape[0]
df = df[df["product_name"].notna() & (df["product_name"].str.strip() != "")]
after = df.shape[0]
print(f"✅ Rows removed: {before - after}. Remaining: {after}")

print("🔹 Keeping only 'code' and 'product_name' columns...")
df = df[["code", "product_name"]]
print(f"✅ Columns retained: {df.columns.tolist()}")

print("✏️ Creating normalized 'product_name_norm' column (lowercase & stripped)...")
df["product_name_norm"] = df["product_name"].str.strip().str.lower()
print("✅ Normalized column added. Sample:")
print(df.head())

print("💾 Saving cleaned CSV to 'products_cleaned.csv'...")
df.to_csv("products_cleaned.csv", index=False)
print("🎉 CSV cleanup complete! Saved as 'products_cleaned.csv'")
