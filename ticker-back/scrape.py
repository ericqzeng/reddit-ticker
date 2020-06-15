import sys
import getopt
import praw
import uuid
import json
import datetime

reddit = praw.Reddit("yeet", user_agent="Price Ticker")

# contact API to put w/ query options

known = {}  # storage of pulled posts
timecode = 0  # timecode to stop paring at

try:
    opts, args = getopt.getopt(sys.argv[1:], "t:",)
except getopt.GetoptError:
    print('scrape.py -t <unix timecode>')
    sys.exit(2)
for opt, arg in opts:
    if opt == '-t':
        timecode = int(arg)

if timecode is 0:
    print('scrape.py -t <unix timecode>')
    sys.exit(2)

# TODO: alternative approach with pushshift?
# http://api.pushshift.io/reddit/submission/search/?after=1577836800&before=1577838800&subreddit=mechmarket
# seems like 100 is the default limit set by praw?
for submission in reddit.subreddit("mechmarket").new():
    if (submission.created_utc > timecode):
        known[submission.id] = {
            'timestamp': submission.created_utc, 'author': str(submission.author), 'link': submission.permalink,
            'title': submission.title, 'selftext': submission.selftext, 'flair': submission.link_flair_text}

print(json.dumps(known), flush=True, end='')
