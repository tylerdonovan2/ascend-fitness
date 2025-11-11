import duckdb

con = duckdb.connect()

query = """
WITH expanded AS (
    SELECT
        code,
        pn.lang AS lang,
        pn.text AS product_name_text
    FROM read_parquet('food.parquet'),
         UNNEST(product_name) AS pn
),

english AS (
    SELECT
        code,
        product_name_text
    FROM expanded
    WHERE lang = 'main'
),

cleaned AS (
    SELECT
        code,
        product_name_text,
        LOWER(
            regexp_replace(
                regexp_replace(product_name_text, '[^a-zA-Z0-9 ]', ' ', 'g'),
                '[ ]+', ' ', 'g'
            )
        ) AS normalized_name
    FROM english
)

SELECT *
FROM cleaned;

"""

df = con.execute(query).df()
print(df.head())
