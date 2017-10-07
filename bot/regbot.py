import praw
import prawcore
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

def start():
    try:
        get_comments()
    except prawcore.exceptions.RequestException:
        print("RequestException occurred, restarting...")
        start()

def get_comments():
    for comment in subreddit.stream.comments():
        text = comment.body
        if '!ethreg' in text.lower():
            cursor.execute("INSERT INTO reg_comments (comment_id) VALUES (%s) ON CONFLICT (comment_id) DO NOTHING", (comment.id,))
            conn.commit()

print("streaming from:", subreddit)
start()
conn.close()
