import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost,1435;"
    "DATABASE=ceramica;"
    "UID=sa;"
    "PWD=123456"
)

try:
    conn = pyodbc.connect(conn_str)
    print("✅ Conectado con éxito")
except Exception as e:
    print("❌ Error:", e)
