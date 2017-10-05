import psycopg2

conn_string = "host='localhost' dbname='reddit' user='postgres' password=''"
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

cursor.execute("SELECT address FROM users WHERE username = %s", ("peaches93882",))
user = cursor.fetchone()
print(user is not None)
