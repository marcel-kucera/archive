import requests
import shutil
from subprocess import run, DEVNULL
import os

import pickle
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from google.auth.transport.requests import Request
from googleapiclient.http import MediaFileUpload

print("Generating title and description with counter")

if not os.path.isfile("counter.txt"):
    file = open("counter.txt", "w")
    file.write(str(1))
    file.close()

file = open("counter.txt", "r")
number = file.read().rstrip()
file.close()

file = open("counter.txt", "w")
file.write(str((int(number)+1)))
file.close()

print("Counter: {}".format(number))

title = "Perfectly Cut Screams {}".format(number)
desc = "Perfectly Cut Screams {}\nAll Copyright to their respective owners".format(
    number)

print("Getting posts from reddit api")
r = requests.get("https://api.reddit.com/r/perfectlycutscreams/top?t=today", headers={
                 "User-agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0"}).json()["data"]["children"]

urls = []

print("Sorting out non video posts")
for post in r:
    if post["data"]["is_video"]:
        urls.append(post["data"]["media"]["reddit_video"]["fallback_url"])
    if "crosspost_parent_list" in post["data"]:
        if post["data"]["crosspost_parent_list"][0]["is_video"]:
            urls.append(post["data"]["crosspost_parent_list"]
                        [0]["media"]["reddit_video"]["fallback_url"])

if(True):
    print("Downloading video and audio")
    for index, url in enumerate(urls):
        # Video Download
        shutil.copyfileobj(requests.get(url, stream=True).raw,
                           open(str(index)+".mp4", "wb"))

        # Audio Download
        audioRequest = requests.get(url.split("/DASH")[0]+"/DASH_audio.mp4")
        if audioRequest.status_code == 403:
            shutil.copyfileobj(requests.get(url.split("/DASH")[0]+"/audio", stream=True).raw,
                               open(str(index)+".mp3", "wb"))
        else:
            shutil.copyfileobj(requests.get(url.split("_")[0]+"_audio.mp4", stream=True).raw,
                               open(str(index)+".mp3", "wb"))

    print("Merging video and audio")
    for index in range(len(urls)):
        run(
            "ffmpeg -y -i {}.mp4 -i {}.mp3 -c:v copy -c:a copy {}-fin.mp4".format(
                index, index, index).split(" "), stdout=DEVNULL, stderr=DEVNULL)
        os.remove("{}.mp4".format(index))
        os.remove("{}.mp3".format(index))

    print("Preparing videos")
    for index in range(len(urls)):
        run(
            "ffmpeg -y -i {}-fin.mp4 -vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2 {}.mp4".format(index, index).split(" "), stdout=DEVNULL, stderr=DEVNULL)
        os.remove("{}-fin.mp4".format(index))

    print("Merging all videos")
    inputFile = open("input.txt", "w")
    for index in range(len(urls)):
        inputFile.write("file {}.mp4\n".format(index))
    inputFile.close()

    run(
        "ffmpeg -y -f concat -safe 0 -i input.txt -c copy output.mp4".split(" "), stdout=DEVNULL, stderr=DEVNULL)

    for index in range(len(urls)):
        os.remove("{}.mp4".format(index))

    os.remove("input.txt")

# Disable OAuthlib's HTTPS verification when running locally.
# *DO NOT* leave this option enabled in production.
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Set api vars
api_service_name = "youtube"
api_version = "v3"
client_secrets_file = "client_secrets.json"

print("Logging in")
# Get credentials
creds = None
# Try to load stored credentials
if os.path.exists('token.pickle'):
    with open('token.pickle', 'rb') as token:
        creds = pickle.load(token)
# If load fails login manually
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
            'client_secrets.json', ["https://www.googleapis.com/auth/youtube.upload"])
        creds = flow.run_local_server(port=0)
        # Save the credentials
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

# Create youtube object
youtube = googleapiclient.discovery.build(
    api_service_name, api_version, credentials=creds)

# Create upload request
request = youtube.videos().insert(
    part="snippet,status",
    body={
        "snippet": {
            "categoryId": "23",
            "description": desc,
            "title": title
        },
        "status": {
            "privacyStatus": "public"
        }
    },

    media_body=MediaFileUpload("./output.mp4")
)

print("Uploading")
response = request.execute()

os.remove("output.mp4")

print("Done")
