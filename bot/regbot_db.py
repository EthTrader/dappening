import sqlite3
conn = sqlite3.connect('regbot.db')

c = conn.cursor()

c.execute("CREATE TABLE comments(comment_id TEXT PRIMARY KEY, replied INTEGER)")

# Save (commit) the changes
conn.commit()

# We can also close the connection if we are done with it.
# Just be sure any changes have been committed or they will be lost.
conn.close()
