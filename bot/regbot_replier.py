import praw
import time
import psycopg2

conn_string = "host='localhost' dbname='reddit' user='postgres' password=''"
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

reddit = praw.Reddit()

while True:
    cursor.execute("SELECT comment_id FROM reg_comments WHERE replied = false ORDER BY created_at ASC")
    unreplied = cursor.fetchall()
    for comment_id in [i[0] for i in unreplied]:
        comment = reddit.comment(comment_id)
        comment.reply("your karma is x")
        cursor.execute("UPDATE reg_comments SET replied = true WHERE comment_id = %s", (comment_id,))
        conn.commit()
        print(comment_id)
        time.sleep(2)   # no more than 1 reply every 2s
    time.sleep(10)      # only check db for new comments every 10s

conn.close()
