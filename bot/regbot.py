import praw
import time
import psycopg2
import argparse

conn_string = "host='localhost' dbname='reddit' user='postgres' password=''"
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

reddit = praw.Reddit()

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--sub', help='the subreddit to watch')
args = vars(parser.parse_args())

subreddit = reddit.subreddit(args['sub'])
print("streaming from:", subreddit)
comments = subreddit.stream.comments()

for comment in comments:
    text = comment.body # Fetch body
    author = comment.author # Fetch author
    if '!ethreg' in text.lower():
        try:
            cursor.execute("INSERT INTO reg_comments (comment_id) VALUES (%s)", (comment.id,))
            conn.commit()
        except Exception as err:
            print(err)

conn.close()
