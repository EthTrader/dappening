import praw
import time
import sqlite3
conn = sqlite3.connect('regbot.db')

reddit = praw.Reddit()
c = conn.cursor()

subreddit = reddit.subreddit('ethtrader_test')
comments = subreddit.stream.comments()

for comment in comments:
    text = comment.body # Fetch body
    author = comment.author # Fetch author
    if '!ethreg' in text.lower():
        c.execute("INSERT INTO comments (comment_id, replied) VALUES (?, 0)", (comment.id,))
        conn.commit()

conn.close()
