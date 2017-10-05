import praw
import time
import sqlite3
conn = sqlite3.connect('regbot.db')

reddit = praw.Reddit()
c = conn.cursor()

while True:
    for (comment_id,) in c.execute("SELECT comment_id FROM comments WHERE replied = 0"):
        comment = reddit.comment(comment_id)
        comment.reply("your karma is x")
        c.execute("UPDATE comments SET replied = 1 WHERE comment_id=?", (comment_id,))
        conn.commit()
        print(comment_id)
        time.sleep(2)   # no more than 1 reply every 2s
    time.sleep(10)      # only check db for new comments every 10s

conn.close()
